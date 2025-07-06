"""Service for managing user workout plans and tracking workout progress."""

from app.extensions import mongo
from app.models.user import User
from app.models.workouts import WorkoutPlan
from app.utils.utils import convert_to_objectid
from datetime import datetime, timedelta
from typing import List, TypedDict, Optional

import logging

from app.models.challenges import ChallengeModel
from app.types.challenge_types import ChallengeProgress


class DayProgress(TypedDict):
    """Represents a single day's workout progress with completion and exercise details."""

    day_of_week: str
    date: str
    is_completed: bool
    exercises: List[dict]


class WeeklyProgress(TypedDict):
    """Represents a week's workout progress including individual day data and summary."""

    week_start_date: str
    week_end_date: str
    progress: float
    days: List[DayProgress]


class UserWorkoutService:
    """Service class that handles workout tracking, progress calculation, and updates."""

    @staticmethod
    def calculate_week_number(start_date_str: str, completed_date_str: str) -> int:
        """Calculate the week number based on start date and completed date."""
        start_date = datetime.strptime(start_date_str, "%Y-%m-%dT%H:%M:%S.%f")
        completed_date = datetime.strptime(completed_date_str, "%Y-%m-%dT%H:%M:%S.%f")
        delta_days = (completed_date - start_date).days
        week_number = delta_days // 7 + 1
        return week_number

    @staticmethod
    def _fetch_active_plan(user: dict, workout_plan_id: str) -> Optional[dict]:
        """Retrieve the user's active workout plan."""
        active_plan = next(
            (
                plan
                for plan in user.get("workout_history", {}).get("active_plans", [])
                if plan["workout_plan_id"] == workout_plan_id and not plan.get("is_completed")
            ),
            None,
        )
        return active_plan

    @staticmethod
    def _fetch_workout_plan(workout_plan_id: str) -> Optional[dict]:
        """Fetch workout plan from the database."""
        workout_plan = WorkoutPlan.get_workout_plan_by_id(workout_plan_id)
        return workout_plan

    @staticmethod
    def _update_progress_details(
        active_plan: dict,
        completed_workout: dict,
        workout_day: dict,
        week_number: int,
    ) -> None:
        """Update progress details with the completed or in-progress workout."""
        progress_details = active_plan.setdefault("progress_details", [])
        day_identifier = completed_workout.get("day_of_week") or completed_workout.get(
            "sequence_day"
        )
        day_progress = next(
            (
                dp
                for dp in progress_details
                if (
                    dp.get("day_of_week") == day_identifier
                    or dp.get("sequence_day") == day_identifier
                )
            ),
            None,
        )

        if not day_progress:
            day_progress = {
                "week_number": week_number,
                "day_of_week": completed_workout.get("day_of_week"),
                "sequence_day": completed_workout.get("sequence_day"),
                "is_completed": False,
                "exercises": [],
            }
            progress_details.append(day_progress)

        existing_exercises = {ex["exercise_id"]: ex for ex in day_progress.get("exercises", [])}
        new_exercises = {ex["exercise_id"]: ex for ex in completed_workout.get("exercises", [])}

        for ex_id, ex_data in new_exercises.items():
            if ex_id in existing_exercises:
                existing_ex = existing_exercises[ex_id]
                existing_ex["sets_completed"] = max(
                    existing_ex.get("sets_completed", 0),
                    ex_data.get("sets_completed", 0),
                )
                existing_ex["reps_completed"] = existing_ex.get("reps_completed", []) + ex_data.get(
                    "reps_completed", []
                )
                existing_ex["duration_seconds"] += ex_data.get("duration_seconds", 0)
                existing_ex["calories_burned"] += ex_data.get("calories_burned", 0)
                existing_ex["is_completed"] = existing_ex.get("is_completed") or ex_data.get(
                    "is_completed"
                )
            else:
                day_progress["exercises"].append(ex_data)

        scheduled_exercises = workout_day.get("exercises", [])
        scheduled_exercise_ids = {
            ex.get("exercise_id") or ex.get("exerciseId") for ex in scheduled_exercises
        }
        completed_exercise_ids = {
            ex["exercise_id"] for ex in day_progress["exercises"] if ex.get("is_completed")
        }

        if completed_exercise_ids >= scheduled_exercise_ids:
            day_progress["is_completed"] = True

        active_plan["progress_details"] = progress_details

    @staticmethod
    def _recalculate_progress(active_plan: dict, workout_plan: dict) -> None:
        """Recalculate the overall progress of the active plan."""
        total_scheduled_workouts = len(workout_plan.get("workout_schedule", []))
        progress_details = active_plan.get("progress_details", [])
        completed_workouts = sum(1 for dp in progress_details if dp.get("is_completed"))

        if total_scheduled_workouts > 0:
            active_plan["progress"] = (completed_workouts / total_scheduled_workouts) * 100
        else:
            active_plan["progress"] = 0.0

        if completed_workouts >= total_scheduled_workouts:
            active_plan["is_completed"] = True
        else:
            active_plan["is_completed"] = False

    @staticmethod
    def save_completed_workout(user_id: str, completed_workout: dict) -> None:
        """Save the completed workout and update user progress."""
        try:
            search_id = convert_to_objectid(user_id)

            result = mongo.db.users.update_one(
                {"_id": search_id},
                {"$push": {"workout_history.completed_workouts": completed_workout}},
            )

            if result.modified_count > 0:
                logging.info(f"Workout saved and progress updated for user {search_id}.")
                return

            logging.error(
                f"Completed workout {completed_workout}, could not be saved for user {search_id}"
            )
        except Exception as e:
            logging.error(f"Error saving completed workout: {str(e)}")
            raise

    @staticmethod
    def _calculate_personalized_progress(
        active_plan: dict, workout_plan: dict
    ) -> tuple[float, list[dict]]:
        """
        Calculate progress and exercises left.

        This is for personalized plans, considering ongoing and partial completions.
        """
        progress_details = active_plan.get("progress_details", [])
        today = datetime.now()
        start_date = datetime.strptime(active_plan["start_date"], "%Y-%m-%dT%H:%M:%S.%f")
        delta_days = (today - start_date).days
        current_week_number = (delta_days // 7) + 1
        today_weekday = today.strftime("%A").lower()

        today_scheduled_day = next(
            (
                day
                for day in workout_plan.get("workout_schedule", [])
                if day.get("day_of_week") == today_weekday
            ),
            None,
        )

        # If there's no scheduled workout for today, return 0% progress and empty exercises_left
        if not today_scheduled_day:
            return 0.0, []

        scheduled_exercises = today_scheduled_day.get("exercises", [])
        total_sets = sum(ex.get("sets", 0) for ex in scheduled_exercises)

        today_progress: dict = next(
            (
                dp
                for dp in progress_details
                if dp.get("week_number") == current_week_number
                and dp.get("day_of_week") == today_weekday
            ),
            {},
        )

        if today_progress is None:
            today_progress = {
                "week_number": current_week_number,
                "day_of_week": today_weekday,
                "sequence_day": None,
                "is_completed": False,
                "exercises": [],
            }
            progress_details.append(today_progress)

        in_progress_workout = active_plan.get("in_progress_workout", {})

        if in_progress_workout and in_progress_workout.get("day_of_week") == today_weekday:
            workout_date = datetime.strptime(
                in_progress_workout.get("date"), "%Y-%m-%dT%H:%M:%S.%f"
            ).date()

            if workout_date == today.date():
                in_progress_exercises = in_progress_workout.get("exercises", [])
                for ex in in_progress_exercises:
                    existing_ex = next(
                        (
                            e
                            for e in today_progress.get("exercises", [])
                            if e["exercise_id"] == ex["exercise_id"]
                        ),
                        None,
                    )
                    if existing_ex:
                        existing_ex["sets_completed"] = max(
                            existing_ex.get("sets_completed", 0),
                            ex.get("sets_completed", 0),
                        )
                        existing_ex["reps_completed"] = existing_ex.get(
                            "reps_completed", []
                        ) + ex.get("reps_completed", [])
                        existing_ex["duration_seconds"] += ex.get("duration_seconds", 0)
                        existing_ex["calories_burned"] += ex.get("calories_burned", 0)
                        existing_ex["is_completed"] = existing_ex.get("is_completed") or ex.get(
                            "is_completed"
                        )
                    else:
                        # Add new exercise progress
                        today_progress.setdefault("exercises", []).append(ex)

        # Calculate sets completed
        sets_completed = 0
        exercises_left_for_today = []
        for scheduled_ex in scheduled_exercises:
            ex_id = scheduled_ex["exercise_id"]
            scheduled_sets = scheduled_ex.get("sets", 0)
            progress_ex: dict = next(
                (ex for ex in today_progress.get("exercises", {}) if ex["exercise_id"] == ex_id),
                {},
            )
            sets_completed_for_ex = progress_ex.get("sets_completed", 0)

            # Add to total sets completed
            sets_completed += sets_completed_for_ex

            # Determine if there are sets left for this exercise
            sets_left = scheduled_sets - sets_completed_for_ex
            if sets_left > 0:
                # Include in exercises left with sets left information
                exercise_info = {
                    "exercise_id": ex_id,
                    "sets_left": sets_left,
                    "total_sets": scheduled_sets,
                    "reps": scheduled_ex.get("reps"),
                    "rest_seconds": scheduled_ex.get("rest_seconds"),
                }
                exercises_left_for_today.append(exercise_info)

        # Calculate progress percentage
        progress_percentage = (sets_completed / total_sets) * 100 if total_sets else 0.0

        return progress_percentage, exercises_left_for_today

    @staticmethod
    def _calculate_challenge_progress(
        active_plan: dict, workout_plan: dict
    ) -> tuple[float, list[dict]]:
        """Calculate progress and exercises left for challenge plans."""
        progress_details = active_plan.get("progress_details", [])
        total_days = len(workout_plan.get("workout_schedule", []))
        completed_days = sum(1 for dp in progress_details if dp.get("is_completed"))
        progress_percentage = (completed_days / total_days) * 100 if total_days else 0.0

        start_date = datetime.strptime(active_plan["start_date"], "%Y-%m-%dT%H:%M:%S.%f")
        today = datetime.now()
        delta_days = (today - start_date).days
        current_sequence_day = delta_days + 1

        today_scheduled_day = next(
            (
                day
                for day in workout_plan.get("workout_schedule", [])
                if day.get("sequence_day") == current_sequence_day
            ),
            None,
        )

        if not today_scheduled_day:
            return progress_percentage, []

        today_progress: dict = next(
            (dp for dp in progress_details if dp.get("sequence_day") == current_sequence_day),
            {},
        )

        scheduled_exercises = today_scheduled_day.get("exercises", [])
        completed_exercises_ids = {
            ex["exercise_id"]
            for ex in today_progress.get("exercises", [])
            if ex.get("is_completed")
        }

        exercises_left_for_today = [
            ex for ex in scheduled_exercises if ex["exercise_id"] not in completed_exercises_ids
        ]

        return progress_percentage, exercises_left_for_today

    @staticmethod
    def get_user_progress(user_id: str, workout_plan_id: str) -> dict[str, object]:
        """Retrieve the user's progress and remaining exercises in a workout plan."""
        try:
            search_id = convert_to_objectid(user_id)
            user = User.get_user_by_id(user_id)

            if not user:
                raise RuntimeError(f"Cannot find the user with id: {search_id}")

            active_plan = UserWorkoutService._fetch_active_plan(user, workout_plan_id)

            if not active_plan:
                raise Exception("Active plan not found")

            workout_plan = UserWorkoutService._fetch_workout_plan(workout_plan_id)

            if not workout_plan:
                raise RuntimeError(f"Cannot get user workout plan: {workout_plan_id}")

            plan_type = workout_plan.get("plan_type", "personalized").lower()

            if plan_type == "personalized":
                (
                    progress_percentage,
                    exercises_left,
                ) = UserWorkoutService._calculate_personalized_progress(active_plan, workout_plan)
            elif plan_type == "challenge":
                (
                    progress_percentage,
                    exercises_left,
                ) = UserWorkoutService._calculate_challenge_progress(active_plan, workout_plan)
            elif plan_type == "one_day":
                (
                    progress_percentage,
                    exercises_left,
                ) = UserWorkoutService._calculate_one_day_progress(active_plan, workout_plan)
            else:
                progress_percentage = 0.0
                exercises_left = []

            return {
                "progress": progress_percentage,
                "exercises_left": exercises_left,
            }

        except Exception as e:
            logging.error(f"Error getting user progress: {str(e)}")
            raise

    @staticmethod
    def _calculate_one_day_progress(
        active_plan: dict, workout_plan: dict
    ) -> tuple[float, list[dict]]:
        """Calculate progress and exercises left for one-day workouts."""
        progress_details = active_plan.get("progress_details", [])
        completed_exercises_ids: set[str] = set()
        for dp in progress_details:
            if dp.get("is_completed"):
                completed_exercises_ids.update(
                    ex["exercise_id"] for ex in dp.get("exercises", []) if ex.get("is_completed")
                )

        scheduled_exercises = []
        for day in workout_plan.get("workout_schedule", []):
            scheduled_exercises.extend(day.get("exercises", []))

        total_exercises = len(scheduled_exercises)
        completed_exercises_count = len(completed_exercises_ids)
        progress_percentage = (
            (completed_exercises_count / total_exercises) * 100 if total_exercises else 0.0
        )

        exercises_left = [
            ex for ex in scheduled_exercises if ex["exercise_id"] not in completed_exercises_ids
        ]

        return progress_percentage, exercises_left

    @staticmethod
    def get_weekly_workout_progress(user_id: str) -> WeeklyProgress:
        """Return weekly workout progress summary and completion details for the user."""
        try:
            user = User.get_user_by_id(user_id)
            if not user:
                raise Exception("User not found.")

            active_plan = next(
                (
                    plan
                    for plan in user.get("workout_history", {}).get("active_plans", [])
                    if not plan.get("is_completed") and plan.get("plan_type") == "personalized"
                ),
                None,
            )
            if not active_plan:
                raise Exception("No active workout plan found for user.")

            workout_plan_id = active_plan["workout_plan_id"]
            workout_plan = WorkoutPlan.get_workout_plan_by_id(workout_plan_id)
            if not workout_plan:
                raise Exception("Workout plan not found.")

            start_date_str = active_plan.get("start_date")
            if not start_date_str:
                raise Exception("Active plan has no start_date.")

            start_date = datetime.strptime(start_date_str, "%Y-%m-%dT%H:%M:%S.%f")
            today = datetime.now()
            delta_days = (today - start_date).days
            current_week_number = (delta_days // 7) + 1
            duration_weeks = workout_plan.get("duration_weeks", 0)
            if current_week_number > duration_weeks:
                return {
                    "week_start_date": "",
                    "week_end_date": "",
                    "progress": 0.0,
                    "days": [],
                }

            start_of_week = start_date + timedelta(weeks=(current_week_number - 1))
            end_of_week = start_of_week + timedelta(days=6)

            response: WeeklyProgress = {
                "week_start_date": start_of_week.date().isoformat(),
                "week_end_date": end_of_week.date().isoformat(),
                "progress": 0.0,
                "days": [],
            }

            progress_details = active_plan.get("progress_details", [])
            in_progress_workout = active_plan.get("in_progress_workout", {})

            days_of_week = [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
            ]
            completed_days = 0
            total_scheduled_days = 0

            for day_name in days_of_week:
                day_workout = next(
                    (
                        day
                        for day in workout_plan.get("workout_schedule", [])
                        if day.get("day_of_week") == day_name
                    ),
                    None,
                )
                if not day_workout:
                    continue

                total_scheduled_days += 1
                day_progress: dict = next(
                    (
                        dp
                        for dp in progress_details
                        if dp.get("day_of_week") == day_name
                        and dp.get("week_number") == current_week_number
                    ),
                    {},
                )

                is_completed = day_progress.get("is_completed", False)
                completed_exercises_ids = {
                    ex["exercise_id"]
                    for ex in day_progress.get("exercises", [])
                    if ex.get("is_completed")
                }

                day_date = (start_of_week + timedelta(days=days_of_week.index(day_name))).date()

                if in_progress_workout and in_progress_workout.get("day_of_week") == day_name:
                    in_progress_date_str = in_progress_workout.get("date")
                    if in_progress_date_str:
                        in_progress_date = datetime.strptime(
                            in_progress_date_str, "%Y-%m-%dT%H:%M:%S.%f"
                        )
                        if in_progress_date.date() == day_date:
                            for ex in in_progress_workout.get("exercises", []):
                                if ex.get("is_completed"):
                                    completed_exercises_ids.add(ex["exercise_id"])

                exercises = []
                all_exercises_completed = True
                for exercise in day_workout.get("exercises", []):
                    exercise_id = exercise.get("exercise_id") or exercise.get("exerciseId")
                    is_exercise_completed = exercise_id in completed_exercises_ids

                    if not is_exercise_completed:
                        all_exercises_completed = False

                    exercises.append(
                        {
                            "exercise_id": exercise_id,
                            "name": exercise.get("name"),
                            "sets": exercise.get("sets"),
                            "reps": exercise.get("reps"),
                            "rest_seconds": exercise.get("rest_seconds"),
                            "difficulty": exercise.get("difficulty"),
                            "description": exercise.get("description"),
                            "image_url": exercise.get("image_url"),
                            "video_url": exercise.get("video_url"),
                            "is_completed": is_exercise_completed,
                        }
                    )

                if exercises and all_exercises_completed:
                    is_completed = True
                    completed_days += 1
                else:
                    is_completed = False

                response["days"].append(
                    {
                        "day_of_week": day_name,
                        "date": day_date.isoformat(),
                        "is_completed": is_completed,
                        "exercises": exercises,
                    }
                )

            if total_scheduled_days > 0:
                response["progress"] = (completed_days / total_scheduled_days) * 100
            return response

        except Exception as e:
            logging.error(f"Error getting weekly workout progress: {str(e)}")
            raise

    @staticmethod
    def get_challenge_progress(user_id: str, challenge_id: str) -> ChallengeProgress:
        """Obtiene el progreso detallado de un usuario para un challenge."""
        try:
            user = User.get_user_by_id(user_id)
            if not user:
                raise Exception("Usuario no encontrado.")

            history = user.get("workout_history", {})
            active_list = history.get("active_challenges", [])
            completed_list = history.get("completed_challenges", [])

            active_challenge = next(
                (ch for ch in active_list if ch.get("challenge_id") == challenge_id),
                None,
            )
            completed_by_day = {
                ch.get("sequence_day"): ch
                for ch in completed_list
                if ch.get("challenge_id") == challenge_id
            }

            if not active_challenge and not completed_by_day:
                raise Exception("No hay ningún challenge iniciado ni completado por este usuario.")

            workout_plan = ChallengeModel.get_by_id(challenge_id)
            if not workout_plan:
                raise Exception("Challenge no encontrado en la colección de challenges.")

            total_days = len(workout_plan.workout_schedule)
            response: ChallengeProgress = {
                "challenge_id": challenge_id,
                "name": workout_plan.name,
                "total_days": total_days,
                "progress": 0.0,
                "days": [],
            }

            if active_challenge:
                start_date = datetime.fromisoformat(active_challenge.get("date")).date()
            else:
                first_completed = min(completed_by_day.values(), key=lambda x: x["sequence_day"])
                seq = first_completed["sequence_day"]
                completed_date = datetime.fromisoformat(first_completed.get("date")).date()
                start_date = completed_date - timedelta(days=seq - 1)

            today = datetime.now().date()
            completed_count = 0

            for day_def in workout_plan.workout_schedule:
                seq = day_def.sequence_day
                if seq is None:
                    continue

                day_date = start_date + timedelta(days=seq - 1)

                if seq in completed_by_day:
                    day_progress = completed_by_day[seq]
                    is_completed = True
                    status = "completed"
                    completed_count += 1
                    exercises_done = {
                        ex["exercise_id"]
                        for ex in day_progress.get("exercises", [])
                        if ex.get("is_completed")
                    }
                else:
                    is_completed = False

                    if active_challenge and active_challenge.get("sequence_day") == seq:
                        status = "in_progress"
                        exercises_done = {
                            ex["exercise_id"]
                            for ex in active_challenge.get("exercises", [])
                            if ex.get("is_completed")
                        }
                    else:
                        if day_date < today:
                            status = "failed"
                        elif day_date == today:
                            status = "in_progress"
                        else:
                            status = "pending"
                        exercises_done = set()

                exercises_list = []
                for ex_def in day_def.exercises:
                    ex_id = ex_def.exercise_id
                    detail = ex_def.details
                    exercises_list.append(
                        {
                            "exercise_id": ex_id,
                            "name": detail.name,
                            "sets": ex_def.sets,
                            "reps": ex_def.reps,
                            "rest_seconds": ex_def.rest_seconds,
                            "image_url": detail.image_url,
                            "is_completed": ex_id in exercises_done,
                        }
                    )

                response["days"].append(
                    {
                        "sequence_day": seq,
                        "date": day_date.isoformat(),
                        "is_completed": is_completed,
                        "status": status,
                        "exercises": exercises_list,
                    }
                )

            if total_days:
                response["progress"] = (completed_count / total_days) * 100

            response["days"].sort(key=lambda d: d["sequence_day"])
            return response

        except Exception as e:
            logging.error(f"Error obteniendo progreso challenge: {e}")
            raise

    @staticmethod
    def save_workout_progress(user_id: str, workout_plan_id: str, progress_data: dict) -> None:
        """Save the workout progress for a user including partial or completed states."""
        try:
            user = User.get_user_by_id(user_id)
            if not user:
                raise Exception("User not found.")

            active_plan = UserWorkoutService._fetch_active_plan(user, workout_plan_id)
            if not active_plan:
                raise Exception("Active workout plan not found for user.")

            workout_plan = UserWorkoutService._fetch_workout_plan(workout_plan_id)
            if not workout_plan:
                raise Exception("Workout plan not found.")

            progress_data_copy = progress_data.copy()

            day_identifier = progress_data.get("day_of_week") or progress_data.get("sequence_day")
            if not day_identifier:
                raise ValueError("Progress data must include 'day_of_week' or 'sequence_day'.")

            search_id = convert_to_objectid(user_id)
            # Fetch the scheduled workout day based on the new progress data
            workout_day = next(
                (
                    day
                    for day in workout_plan["workout_schedule"]
                    if day.get("day_of_week") == day_identifier
                    or day.get("sequence_day") == day_identifier
                ),
                None,
            )
            if not workout_day:
                raise ValueError("Workout day not found in the plan.")

            in_progress_workout = active_plan.get("in_progress_workout", None)
            if in_progress_workout:
                in_progress_day_identifier = in_progress_workout.get(
                    "day_of_week"
                ) or in_progress_workout.get("sequence_day")
                if in_progress_day_identifier == day_identifier and in_progress_workout.get(
                    "date"
                ) == progress_data_copy.get("date"):
                    # Same day, merge exercises
                    existing_exercises = {
                        ex["exercise_id"]: ex for ex in in_progress_workout.get("exercises", [])
                    }
                    new_exercises = {
                        ex["exercise_id"]: ex for ex in progress_data_copy.get("exercises", [])
                    }

                    for ex_id, ex_data in new_exercises.items():
                        if ex_id in existing_exercises:
                            existing_ex = existing_exercises[ex_id]
                            existing_ex["sets_completed"] = max(
                                existing_ex.get("sets_completed", 0),
                                ex_data.get("sets_completed", 0),
                            )
                            existing_ex["reps_completed"] = existing_ex.get(
                                "reps_completed", []
                            ) + ex_data.get("reps_completed", [])
                            existing_ex["duration_seconds"] += ex_data.get("duration_seconds", 0)
                            existing_ex["calories_burned"] += ex_data.get("calories_burned", 0)
                            existing_ex["is_completed"] = existing_ex.get(
                                "is_completed"
                            ) or ex_data.get("is_completed")
                        else:
                            existing_exercises[ex_id] = ex_data

                    in_progress_workout["exercises"] = list(existing_exercises.values())
                else:
                    previous_day_identifier = in_progress_workout.get(
                        "day_of_week"
                    ) or in_progress_workout.get("sequence_day")

                    previous_workout_day = next(
                        (
                            day
                            for day in workout_plan["workout_schedule"]
                            if day.get("day_of_week") == previous_day_identifier
                            or day.get("sequence_day") == previous_day_identifier
                        ),
                        None,
                    )
                    if not previous_workout_day:
                        raise ValueError("Previous workout day not found in the plan.")

                    # Calculate week number for the previous day
                    in_progress_date = in_progress_workout.get("date")
                    if not in_progress_date:
                        raise ValueError("In-progress workout must have 'date'.")
                    week_number = UserWorkoutService.calculate_week_number(
                        active_plan["start_date"], in_progress_date
                    )

                    UserWorkoutService._update_progress_details(
                        active_plan,
                        in_progress_workout,
                        previous_workout_day,
                        week_number,
                    )

                    active_plan["in_progress_workout"] = None
                    in_progress_workout = {
                        "workout_id": workout_plan_id,
                        "workout_name": progress_data_copy.get(
                            "workout_name", active_plan.get("workout_name")
                        ),
                        "date": progress_data_copy["date"],
                        "exercises": progress_data_copy["exercises"],
                        "day_of_week": progress_data.get("day_of_week"),
                        "sequence_day": progress_data.get("sequence_day"),
                    }
                    active_plan["in_progress_workout"] = in_progress_workout
            else:
                in_progress_workout = {
                    "workout_id": workout_plan_id,
                    "workout_name": progress_data_copy.get(
                        "workout_name", active_plan.get("workout_name")
                    ),
                    "date": progress_data_copy["date"],
                    "exercises": progress_data_copy["exercises"],
                    "day_of_week": progress_data.get("day_of_week"),
                    "sequence_day": progress_data.get("sequence_day"),
                }
                active_plan["in_progress_workout"] = in_progress_workout

            scheduled_exercises = workout_day.get("exercises", [])
            scheduled_exercise_ids = {
                ex.get("exercise_id") or ex.get("exerciseId") for ex in scheduled_exercises
            }
            completed_exercise_ids = {
                ex["exercise_id"]
                for ex in in_progress_workout.get("exercises", [])
                if ex.get("is_completed")
            }

            if completed_exercise_ids >= scheduled_exercise_ids:
                # All exercises are completed for the day
                # Calculate week number
                completed_date = progress_data.get("date")
                if not completed_date:
                    raise ValueError("Progress data must have 'date'.")
                week_number = UserWorkoutService.calculate_week_number(
                    active_plan["start_date"], completed_date
                )

                UserWorkoutService._update_progress_details(
                    active_plan, in_progress_workout, workout_day, week_number
                )
                UserWorkoutService._recalculate_progress(active_plan, workout_plan)

                # Calculate total duration and calories for the workout
                total_duration_seconds = sum(
                    ex.get("duration_seconds", 0) for ex in in_progress_workout["exercises"]
                )
                total_calories_burned = sum(
                    ex.get("calories_burned", 0) for ex in in_progress_workout["exercises"]
                )

                in_progress_workout["duration_seconds"] = total_duration_seconds
                in_progress_workout["calories_burned"] = total_calories_burned

                active_plan["last_completed_workout"] = in_progress_workout

                active_plan.pop("in_progress_workout", None)
                mongo.db.users.update_one(
                    {
                        "_id": search_id,
                        "workout_history.active_plans.workout_plan_id": workout_plan_id,
                    },
                    {"$push": {"workout_history.completed_workouts": in_progress_workout}},
                )
                mongo.db.users.update_one(
                    {
                        "_id": search_id,
                        "workout_history.active_plans.workout_plan_id": workout_plan_id,
                    },
                    {
                        "$push": {"workout_history.completed_workouts": in_progress_workout},
                        "$unset": {"workout_history.active_plans.$.in_progress_workout": ""},
                    },
                )
            else:
                active_plan["in_progress_workout"] = in_progress_workout

            mongo.db.users.update_one(
                {
                    "_id": search_id,
                    "workout_history.active_plans.workout_plan_id": workout_plan_id,
                },
                {"$set": {"workout_history.active_plans.$": active_plan}},
            )
            logging.info(f"Workout progress saved for user {search_id}.")

        except Exception as e:
            logging.error(f"Error saving workout progress: {str(e)}")
            raise
