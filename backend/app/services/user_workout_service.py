from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta
from typing import Any

from app.extensions import db
from app.repositories.challenge_repository import ChallengeRepository
from app.repositories.progress_repository import (
    ActiveChallengeRepository,
    ActivePlanRepository,
    CompletedChallengeDayRepository,
    CompletedWorkoutRepository,
    DayProgressRepository,
)
from app.repositories.workout_repository import WorkoutPlanRepository

Payload = dict[str, Any]


class UserWorkoutService:
    @staticmethod
    def calculate_week_number(start_date: datetime, completed_date: datetime) -> int:
        delta_days = (completed_date - start_date).days
        return delta_days // 7 + 1

    @staticmethod
    def save_completed_workout(user_id: str, completed_workout: Payload) -> None:
        try:
            user_uuid = uuid.UUID(user_id)
            exercises_data = completed_workout.pop("exercises", [])
            workout_plan_id = completed_workout.pop("workout_id", None)

            raw_date = completed_workout.get("date")
            parsed_date = (
                datetime.fromisoformat(raw_date)
                if isinstance(raw_date, str)
                else (raw_date or datetime.now())
            )
            workout_data = {
                "workout_plan_id": uuid.UUID(workout_plan_id) if workout_plan_id else None,
                "date": parsed_date,
                "duration_seconds": completed_workout.get("duration_seconds", 0),
                "calories_burned": completed_workout.get("calories_burned", 0.0),
                "day_of_week": completed_workout.get("day_of_week"),
                "sequence_day": completed_workout.get("sequence_day"),
                "was_skipped": completed_workout.get("was_skipped", False),
            }

            repo = CompletedWorkoutRepository()
            formatted_exercises = [
                {
                    "exercise_id": ex["exercise_id"],
                    "sets_completed": ex.get("sets_completed", 0),
                    "reps_completed": ex.get("reps_completed", []),
                    "duration_seconds": ex.get("duration_seconds", 0),
                    "calories_burned": ex.get("calories_burned", 0.0),
                    "is_completed": ex.get("is_completed", True),
                }
                for ex in exercises_data
            ]
            repo.save(user_uuid, workout_data, formatted_exercises)
            db.session.flush()
            logging.info(f"Workout saved for user {user_uuid}.")
        except Exception:
            raise

    @staticmethod
    def get_user_progress(user_id: str, workout_plan_id: str) -> dict[str, object]:
        try:
            user_uuid = uuid.UUID(user_id)
            plan_uuid = uuid.UUID(workout_plan_id)

            plan_repo = ActivePlanRepository()
            active_plan = plan_repo.get_active_for_user(user_uuid, plan_uuid)
            if not active_plan:
                raise Exception("Active plan not found")

            wp_repo = WorkoutPlanRepository()
            workout_plan = wp_repo.get_with_schedule(plan_uuid)
            if not workout_plan:
                raise RuntimeError(f"Cannot get workout plan: {workout_plan_id}")

            plan_type = active_plan.plan_type.lower()

            if plan_type == "personalized":
                progress, exercises_left = UserWorkoutService._calc_personalized_progress(
                    active_plan, workout_plan
                )
            elif plan_type == "challenge":
                progress, exercises_left = UserWorkoutService._calc_challenge_progress(
                    active_plan, workout_plan
                )
            else:
                progress, exercises_left = 0.0, []

            return {"progress": progress, "exercises_left": exercises_left}
        except Exception as e:
            logging.error(f"Error getting user progress: {e}")
            raise

    @staticmethod
    def _calc_personalized_progress(
        active_plan: Any, workout_plan: Any
    ) -> tuple[float, list[Payload]]:
        today = datetime.now(active_plan.start_date.tzinfo)
        delta_days = (today - active_plan.start_date).days
        current_week = (delta_days // 7) + 1
        today_weekday = today.strftime("%A").lower()

        today_day = None
        for day in workout_plan.workout_days:
            if day.day_of_week == today_weekday:
                today_day = day
                break

        if not today_day:
            return 0.0, []

        total_sets = sum(ex.sets for ex in today_day.exercises)

        today_progress = None
        for dp in active_plan.progress_details:
            if dp.day_of_week == today_weekday and dp.week_number == current_week:
                today_progress = dp
                break

        sets_completed = 0
        exercises_left: list[Payload] = []
        completed_map: dict[str, int] = {}

        if today_progress:
            for ep in today_progress.exercises:
                completed_map[str(ep.exercise_id)] = ep.sets_completed

        for sched_ex in today_day.exercises:
            ex_id = str(sched_ex.exercise_id)
            done = completed_map.get(ex_id, 0)
            sets_completed += done
            left = sched_ex.sets - done
            if left > 0:
                exercises_left.append(
                    {
                        "exercise_id": ex_id,
                        "sets_left": left,
                        "total_sets": sched_ex.sets,
                        "reps": sched_ex.reps,
                        "rest_seconds": sched_ex.rest_seconds,
                    }
                )

        progress_pct = (sets_completed / total_sets) * 100 if total_sets else 0.0
        return progress_pct, exercises_left

    @staticmethod
    def _calc_challenge_progress(
        active_plan: Any, workout_plan: Any
    ) -> tuple[float, list[Payload]]:
        total_days = len(workout_plan.workout_days)
        completed_days = sum(1 for dp in active_plan.progress_details if dp.is_completed)
        progress_pct = (completed_days / total_days) * 100 if total_days else 0.0

        delta = (datetime.now(active_plan.start_date.tzinfo) - active_plan.start_date).days
        current_seq = delta + 1

        today_day = None
        for day in workout_plan.workout_days:
            if day.sequence_day == current_seq:
                today_day = day
                break

        if not today_day:
            return progress_pct, []

        today_dp = None
        for dp in active_plan.progress_details:
            if dp.sequence_day == current_seq:
                today_dp = dp
                break

        completed_ids: set[str] = set()
        if today_dp:
            for ep in today_dp.exercises:
                if ep.is_completed:
                    completed_ids.add(str(ep.exercise_id))

        exercises_left = [
            {
                "exercise_id": str(ex.exercise_id),
                "sets": ex.sets,
                "reps": ex.reps,
                "rest_seconds": ex.rest_seconds,
            }
            for ex in today_day.exercises
            if str(ex.exercise_id) not in completed_ids
        ]

        return progress_pct, exercises_left

    @staticmethod
    def get_weekly_workout_progress(user_id: str) -> Payload:
        try:
            user_uuid = uuid.UUID(user_id)
            plan_repo = ActivePlanRepository()
            active_plans = plan_repo.get_by_user(user_uuid)

            active_plan = next(
                (p for p in active_plans if not p.is_completed and p.plan_type == "personalized"),
                None,
            )
            if not active_plan:
                raise Exception("No active workout plan found.")

            wp_repo = WorkoutPlanRepository()
            workout_plan = wp_repo.get_with_schedule(active_plan.workout_plan_id)
            if not workout_plan:
                raise Exception("Workout plan not found.")

            start_date = active_plan.start_date
            today = datetime.now(start_date.tzinfo)
            delta_days = (today - start_date).days
            current_week = (delta_days // 7) + 1
            duration_weeks = workout_plan.duration_weeks or 0

            if current_week > duration_weeks:
                return {"week_start_date": "", "week_end_date": "", "progress": 0.0, "days": []}

            start_of_week = start_date + timedelta(weeks=(current_week - 1))
            end_of_week = start_of_week + timedelta(days=6)

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
            total_scheduled = 0
            response_days: list[Payload] = []

            day_map = {d.day_of_week: d for d in workout_plan.workout_days if d.day_of_week}
            progress_map: dict[str, Any] = {}
            for dp in active_plan.progress_details:
                if dp.week_number == current_week and dp.day_of_week:
                    progress_map[dp.day_of_week] = dp

            for day_name in days_of_week:
                day_workout = day_map.get(day_name)
                if not day_workout:
                    continue

                total_scheduled += 1
                dp = progress_map.get(day_name)
                completed_exercise_ids: set[str] = set()
                if dp:
                    for ep in dp.exercises:
                        if ep.is_completed:
                            completed_exercise_ids.add(str(ep.exercise_id))

                day_date = (start_of_week + timedelta(days=days_of_week.index(day_name))).date()
                exercises = []
                all_done = True
                for wde in day_workout.exercises:
                    ex = wde.exercise
                    is_done = str(wde.exercise_id) in completed_exercise_ids
                    if not is_done:
                        all_done = False
                    exercises.append(
                        {
                            "exercise_id": str(wde.exercise_id),
                            "name": ex.name if ex else None,
                            "sets": wde.sets,
                            "reps": wde.reps,
                            "rest_seconds": wde.rest_seconds,
                            "difficulty": ex.difficulty if ex else None,
                            "description": ex.description if ex else None,
                            "image_url": ex.image_url if ex else None,
                            "video_url": ex.video_url if ex else None,
                            "is_completed": is_done,
                        }
                    )

                is_completed = all_done and bool(exercises)
                if is_completed:
                    completed_days += 1

                response_days.append(
                    {
                        "day_of_week": day_name,
                        "date": day_date.isoformat(),
                        "is_completed": is_completed,
                        "exercises": exercises,
                    }
                )

            progress = (completed_days / total_scheduled) * 100 if total_scheduled else 0.0

            return {
                "week_start_date": start_of_week.date().isoformat(),
                "week_end_date": end_of_week.date().isoformat(),
                "progress": progress,
                "days": response_days,
            }
        except Exception as e:
            logging.error(f"Error getting weekly progress: {e}")
            raise

    @staticmethod
    def get_challenge_progress(user_id: str, challenge_id: str) -> Payload:
        try:
            user_uuid = uuid.UUID(user_id)
            challenge_uuid = uuid.UUID(challenge_id)

            challenge_repo = ChallengeRepository()
            challenge = challenge_repo.get_with_schedule(challenge_uuid)
            if not challenge:
                raise Exception("Challenge not found.")

            active_repo = ActiveChallengeRepository()
            active = active_repo.get_for_user(user_uuid, challenge_uuid)

            completed_repo = CompletedChallengeDayRepository()
            completed_days = completed_repo.get_by_user_challenge(user_uuid, challenge_uuid)
            completed_by_seq = {cd.sequence_day: cd for cd in completed_days}

            if not active and not completed_by_seq:
                raise Exception("No challenge started for this user.")

            total_days = len(challenge.challenge_days)

            if active:
                start_date = (
                    active.date.date()
                    if isinstance(active.date, datetime)
                    else datetime.fromisoformat(str(active.date)).date()
                )
            else:
                first = min(completed_by_seq.values(), key=lambda x: x.sequence_day)
                first_date = (
                    first.date.date()
                    if isinstance(first.date, datetime)
                    else datetime.fromisoformat(str(first.date)).date()
                )
                start_date = first_date - timedelta(days=first.sequence_day - 1)

            today = datetime.now().date()
            completed_count = 0
            response_days: list[Payload] = []

            for cday in challenge.challenge_days:
                seq = cday.sequence_day
                day_date = start_date + timedelta(days=seq - 1)

                if seq in completed_by_seq:
                    cd = completed_by_seq[seq]
                    is_completed = True
                    status = "completed"
                    completed_count += 1
                    done_ids = {str(ex.exercise_id) for ex in cd.exercises if ex.is_completed}
                else:
                    is_completed = False
                    if active and active.sequence_day == seq:
                        status = "in_progress"
                        done_ids = {
                            str(ex.exercise_id) for ex in active.exercises if ex.is_completed
                        }
                    elif day_date < today:
                        status = "failed"
                        done_ids = set()
                    elif day_date == today:
                        status = "in_progress"
                        done_ids = set()
                    else:
                        status = "pending"
                        done_ids = set()

                exercises_list = []
                for cde in cday.exercises:
                    ex = cde.exercise
                    exercises_list.append(
                        {
                            "exercise_id": str(cde.exercise_id),
                            "name": ex.name if ex else "",
                            "sets": cde.sets,
                            "reps": cde.reps,
                            "rest_seconds": cde.rest_seconds,
                            "image_url": ex.image_url if ex else "",
                            "is_completed": str(cde.exercise_id) in done_ids,
                        }
                    )

                response_days.append(
                    {
                        "sequence_day": seq,
                        "date": day_date.isoformat(),
                        "is_completed": is_completed,
                        "status": status,
                        "exercises": exercises_list,
                    }
                )

            progress = (completed_count / total_days) * 100 if total_days else 0.0
            response_days.sort(key=lambda d: d["sequence_day"])

            return {
                "challenge_id": challenge_id,
                "name": challenge.name,
                "total_days": total_days,
                "progress": progress,
                "days": response_days,
            }
        except Exception as e:
            logging.error(f"Error getting challenge progress: {e}")
            raise

    @staticmethod
    def save_workout_progress(user_id: str, workout_plan_id: str, progress_data: Payload) -> None:
        try:
            user_uuid = uuid.UUID(user_id)
            plan_uuid = uuid.UUID(workout_plan_id)

            plan_repo = ActivePlanRepository()
            active_plan = plan_repo.get_active_for_user(user_uuid, plan_uuid)
            if not active_plan:
                raise Exception("Active workout plan not found.")

            wp_repo = WorkoutPlanRepository()
            workout_plan = wp_repo.get_with_schedule(plan_uuid)
            if not workout_plan:
                raise Exception("Workout plan not found.")

            day_id = progress_data.get("day_of_week") or progress_data.get("sequence_day")
            if not day_id:
                raise ValueError("Progress data must include day_of_week or sequence_day.")

            workout_day = None
            for d in workout_plan.workout_days:
                if d.day_of_week == day_id or d.sequence_day == day_id:
                    workout_day = d
                    break
            if not workout_day:
                raise ValueError("Workout day not found in plan.")

            completed_date = progress_data.get("date")
            week_number = None
            if completed_date:
                if isinstance(completed_date, str):
                    completed_date = datetime.fromisoformat(completed_date)
                week_number = UserWorkoutService.calculate_week_number(
                    active_plan.start_date, completed_date
                )

            dp_repo = DayProgressRepository()
            day_progress = dp_repo.find_or_create(
                active_plan_id=active_plan.id,
                week_number=week_number,
                day_of_week=progress_data.get("day_of_week"),
                sequence_day=progress_data.get("sequence_day"),
            )

            for ex_data in progress_data.get("exercises", []):
                dp_repo.add_exercise_progress(
                    day_progress_id=day_progress.id,
                    exercise_id=uuid.UUID(ex_data["exercise_id"]),
                    sets_completed=ex_data.get("sets_completed", 0),
                    reps_completed=ex_data.get("reps_completed", []),
                    duration_seconds=ex_data.get("duration_seconds", 0),
                    calories_burned=ex_data.get("calories_burned", 0.0),
                    is_completed=ex_data.get("is_completed", False),
                )

            scheduled_ids = {str(wde.exercise_id) for wde in workout_day.exercises}
            db.session.refresh(day_progress)
            completed_ids = {
                str(ep.exercise_id) for ep in day_progress.exercises if ep.is_completed
            }

            if completed_ids >= scheduled_ids:
                day_progress.is_completed = True

                total_scheduled = len(workout_plan.workout_days)
                db.session.refresh(active_plan)
                completed_count = sum(1 for dp in active_plan.progress_details if dp.is_completed)
                active_plan.progress = (
                    (completed_count / total_scheduled) * 100 if total_scheduled else 0.0
                )
                active_plan.is_completed = completed_count >= total_scheduled

            db.session.flush()
            logging.info(f"Workout progress saved for user {user_uuid}.")
        except Exception:
            raise
