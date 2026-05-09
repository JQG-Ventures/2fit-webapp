import logging
import random
import uuid
from datetime import datetime, timedelta
from typing import Any

from app.extensions import db
from app.repositories.exercise_repository import ExerciseRepository
from app.repositories.progress_repository import ActivePlanRepository
from app.repositories.workout_repository import WorkoutPlanRepository


class WorkoutPlanGenerator:
    EXERCISE_COUNT_BY_LEVEL = {
        "beginner": {"min": 5, "max": 6},
        "intermediate": {"min": 6, "max": 8},
        "advanced": {"min": 7, "max": 10},
    }

    MUSCLE_GROUPS_MAPPING = {
        "full_body": ["chest", "back", "legs", "shoulders", "arms", "core", "glutes", "calves"],
        "upper_body": ["chest", "back", "shoulders", "arms", "triceps"],
        "lower_body": ["legs", "glutes", "calves"],
        "push": ["chest", "shoulders", "triceps"],
        "pull": ["back", "arms"],
        "legs": ["legs", "glutes", "calves", "quadricep"],
        "core": ["core", "obliques"],
        "chest": ["chest", "upper-chest"],
        "back": ["back", "lower-back", "trapezius", "lats"],
        "shoulders": ["shoulders", "front-deltoid", "rear-deltoid", "deltoid"],
        "arms": ["biceps", "triceps", "forearms"],
    }

    @staticmethod
    def map_user_level(fitness_level: str) -> str:
        return {
            "beginner": "beginner",
            "irregular": "beginner",
            "intermediate": "intermediate",
            "advanced": "advanced",
        }.get(fitness_level, "beginner")

    @staticmethod
    def get_intensity_settings(level: str, fitness_goal: str) -> dict[str, Any]:
        base: dict[str, Any] = {
            "beginner": {"sets": 2, "reps": [12, 15], "rest": 60},
            "intermediate": {"sets": 3, "reps": [8, 12], "rest": 90},
            "advanced": {"sets": 4, "reps": [6, 10], "rest": 120},
        }.get(level, {"sets": 2, "reps": [12, 15], "rest": 60})

        if fitness_goal == "weight":
            base.update({"reps": [12, 15], "rest": 45})
        elif fitness_goal == "strength":
            base.update({"reps": [4, 6], "sets": base.get("sets", 0) + 1, "rest": 180})
        elif fitness_goal == "muscle":
            base.update({"reps": [8, 12], "rest": 90})
        elif fitness_goal == "keep":
            base.update({"reps": [10, 12], "rest": 60})

        return base

    @staticmethod
    def determine_plan_duration(fitness_goal: str, fitness_level: str) -> int:
        durations = {"weight": 16, "strength": 12, "muscle": 12, "keep": 8}
        duration = durations.get(fitness_goal, 12)

        if fitness_level in ("beginner", "irregular"):
            duration = min(duration, 8)
        elif fitness_level == "advanced":
            duration = max(duration, 12)

        return duration

    @staticmethod
    def calculate_splits(days_available: int, fitness_goal: str) -> list[list[str]]:
        _ = fitness_goal
        if days_available >= 5:
            return [
                ["chest", "shoulders", "triceps", "cardio"],
                ["back", "biceps"],
                ["legs", "glutes", "calves", "cardio"],
                ["full_body"],
                ["full_body"],
            ]
        elif days_available == 4:
            return [
                ["chest", "shoulders", "triceps"],
                ["back", "biceps", "cardio"],
                ["legs", "glutes", "calves"],
                ["full_body"],
            ]
        else:
            return [["push", "cardio"], ["legs"], ["pull", "cardio"]]

    @staticmethod
    def _exercise_id(exercise: Any) -> str:
        return str(exercise.id)

    @staticmethod
    def _dedupe_exercises(exercises: list[Any]) -> list[Any]:
        unique_exercises: dict[str, Any] = {}
        for exercise in exercises:
            unique_exercises.setdefault(WorkoutPlanGenerator._exercise_id(exercise), exercise)
        return list(unique_exercises.values())

    @staticmethod
    def _normalize_muscle_groups(exercise: Any) -> set[str]:
        return {muscle.lower() for muscle in getattr(exercise, "muscle_group", [])}

    @staticmethod
    def _expand_muscle_groups(muscle_groups: list[str]) -> list[str]:
        expanded_groups: list[str] = []
        seen_groups: set[str] = set()
        for group in muscle_groups:
            for mapped_group in WorkoutPlanGenerator.MUSCLE_GROUPS_MAPPING.get(group, []):
                if mapped_group in seen_groups:
                    continue
                seen_groups.add(mapped_group)
                expanded_groups.append(mapped_group)
        return expanded_groups

    @staticmethod
    def _sample_unique_candidates(
        candidates: list[Any], limit: int, selected_ids: set[str]
    ) -> list[Any]:
        if limit <= 0:
            return []

        available = [
            exercise
            for exercise in candidates
            if WorkoutPlanGenerator._exercise_id(exercise) not in selected_ids
        ]
        if not available:
            return []

        return random.sample(available, min(limit, len(available)))

    @staticmethod
    def generate_day_routine(
        muscle_groups: list[str],
        exercises: list[Any],
        settings: dict[str, Any],
        level: str,
        cardio: bool = False,
    ) -> list[dict[str, Any]]:
        exercise_range = WorkoutPlanGenerator.EXERCISE_COUNT_BY_LEVEL[level]
        total_exercises = random.randint(exercise_range["min"], exercise_range["max"])

        if cardio:
            cardio_count = max(1, total_exercises // 3)
            strength_count = total_exercises - cardio_count
        else:
            strength_count = total_exercises
            cardio_count = 0

        daily_exercises: list[dict[str, Any]] = []
        unique_exercises = WorkoutPlanGenerator._dedupe_exercises(exercises)
        expanded_groups = WorkoutPlanGenerator._expand_muscle_groups(muscle_groups)
        normalized_groups_by_exercise = {
            WorkoutPlanGenerator._exercise_id(
                exercise
            ): WorkoutPlanGenerator._normalize_muscle_groups(exercise)
            for exercise in unique_exercises
        }

        strength_exercises: list[Any] = []
        selected_strength_ids: set[str] = set()
        strength_pool = [
            exercise
            for exercise in unique_exercises
            if exercise.category.lower() != "cardio"
            and any(
                group in normalized_groups_by_exercise[WorkoutPlanGenerator._exercise_id(exercise)]
                for group in expanded_groups
            )
        ]

        for muscle_group in expanded_groups:
            remaining_strength_slots = strength_count - len(strength_exercises)
            if remaining_strength_slots <= 0:
                break

            group_candidates = [
                exercise
                for exercise in strength_pool
                if muscle_group
                in normalized_groups_by_exercise[WorkoutPlanGenerator._exercise_id(exercise)]
                and WorkoutPlanGenerator._exercise_id(exercise) not in selected_strength_ids
            ]
            if group_candidates:
                sample_size = min(
                    random.randint(1, 2),
                    len(group_candidates),
                    remaining_strength_slots,
                )
                sampled_group = random.sample(group_candidates, sample_size)
                strength_exercises.extend(sampled_group)
                selected_strength_ids.update(
                    WorkoutPlanGenerator._exercise_id(exercise) for exercise in sampled_group
                )
            if len(strength_exercises) >= strength_count:
                break

        remaining_strength_slots = strength_count - len(strength_exercises)
        if remaining_strength_slots > 0:
            backfill_strength = WorkoutPlanGenerator._sample_unique_candidates(
                strength_pool,
                remaining_strength_slots,
                selected_strength_ids,
            )
            strength_exercises.extend(backfill_strength)
            selected_strength_ids.update(
                WorkoutPlanGenerator._exercise_id(exercise) for exercise in backfill_strength
            )

        cardio_exercises: list[Any] = []
        if cardio:
            available_cardio = [
                exercise
                for exercise in unique_exercises
                if exercise.category.lower() == "cardio"
                and WorkoutPlanGenerator._exercise_id(exercise) not in selected_strength_ids
            ]
            cardio_exercises = random.sample(
                available_cardio, min(cardio_count, len(available_cardio))
            )

        for ex in strength_exercises[:strength_count]:
            daily_exercises.append(
                {
                    "exercise_id": str(ex.id),
                    "sets": settings["sets"],
                    "reps": random.choice(settings["reps"]),
                    "rest_seconds": settings["rest"],
                }
            )
        for ex in cardio_exercises:
            daily_exercises.append(
                {
                    "exercise_id": str(ex.id),
                    "sets": 1,
                    "reps": 10,
                    "rest_seconds": 30,
                }
            )

        return daily_exercises

    @staticmethod
    def generate_workout_plan(user_id: str, user_data: dict[str, Any]) -> None:
        exercise_repo = ExerciseRepository()
        db_exercises = exercise_repo.get_active()

        level = WorkoutPlanGenerator.map_user_level(user_data["fitness_level"])
        settings = WorkoutPlanGenerator.get_intensity_settings(level, user_data["fitness_goal"])
        available_days = user_data.get("available_days", [])
        duration_weeks = WorkoutPlanGenerator.determine_plan_duration(
            user_data["fitness_goal"], user_data["fitness_level"]
        )

        training_splits = WorkoutPlanGenerator.calculate_splits(
            len(available_days), user_data["fitness_goal"]
        )

        days_data = []
        for i, day in enumerate(available_days):
            muscle_groups = training_splits[i % len(training_splits)]
            is_cardio = "cardio" in muscle_groups
            filtered_groups = [mg for mg in muscle_groups if mg != "cardio"]
            daily_routine = WorkoutPlanGenerator.generate_day_routine(
                filtered_groups, db_exercises, settings, level, is_cardio
            )
            days_data.append({"day_of_week": day, "exercises": daily_routine})

        plan_data = {
            "name": f"Auto Plan {user_data.get('name', '')}",
            "description": "Personalized workout plan",
            "plan_type": "personalized",
            "duration_weeks": duration_weeks,
            "price": 0.0,
            "image_url": "",
            "video_url": "",
            "level": level,
            "is_active": True,
        }

        wp_repo = WorkoutPlanRepository()
        plan = wp_repo.create_full_plan(plan_data, days_data)
        plan_name = str(plan_data["name"])

        WorkoutPlanGenerator.set_active_plan_for_user(
            user_id, str(plan.id), plan_name, duration_weeks
        )
        db.session.flush()
        logging.info("User routine saved in db.")

    @staticmethod
    def set_active_plan_for_user(
        user_id: str, plan_id: str, plan_name: str, duration_weeks: int
    ) -> None:
        try:
            user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id

            ap_repo = ActivePlanRepository()
            existing = ap_repo.get_by_user(user_uuid)
            for plan in existing:
                if not plan.is_completed and plan.plan_type == "personalized":
                    plan.is_completed = True

            today = datetime.now()
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(weeks=duration_weeks)

            ap_repo.create(
                user_id=user_uuid,
                workout_plan_id=uuid.UUID(plan_id),
                workout_name=plan_name,
                plan_type="personalized",
                start_date=start_date,
                end_date=end_date,
                is_completed=False,
                progress=0.0,
            )

            db.session.flush()
            logging.info("Set workout plan %s as active for user %s.", plan_id, user_uuid)
        except Exception as e:
            logging.error("Error setting active workout plan: %s", e)
            raise
