import uuid
from typing import Any, cast

from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.workout_plan import WorkoutDay, WorkoutDayExercise, WorkoutPlan
from app.repositories.base import BaseRepository


class WorkoutPlanRepository(BaseRepository[WorkoutPlan]):
    def __init__(self) -> None:
        super().__init__(WorkoutPlan)

    @staticmethod
    def _unique_exercises_data(exercises_data: list[dict[str, Any]]) -> list[dict[str, Any]]:
        unique_by_exercise_id: dict[str, dict[str, Any]] = {}
        for exercise_data in exercises_data:
            exercise_id = str(exercise_data["exercise_id"])
            if exercise_id in unique_by_exercise_id:
                continue
            unique_by_exercise_id[exercise_id] = {**exercise_data, "exercise_id": exercise_id}
        return list(unique_by_exercise_id.values())

    @staticmethod
    def _create_workout_day_exercise(
        workout_day_id: uuid.UUID, exercise_data: dict[str, Any]
    ) -> WorkoutDayExercise:
        exercise_id = uuid.UUID(str(exercise_data["exercise_id"]))
        exercise_values = {
            key: value for key, value in exercise_data.items() if key != "exercise_id"
        }
        return WorkoutDayExercise(
            workout_day_id=workout_day_id,
            exercise_id=exercise_id,
            **exercise_values,
        )

    def _append_day_schedule(self, workout_plan_id: uuid.UUID, day_data: dict[str, Any]) -> None:
        exercises_data = cast(list[dict[str, Any]], day_data.get("exercises", []))
        workout_day_values = {key: value for key, value in day_data.items() if key != "exercises"}

        workout_day = WorkoutDay(workout_plan_id=workout_plan_id, **workout_day_values)
        db.session.add(workout_day)
        db.session.flush()

        for exercise_data in self._unique_exercises_data(exercises_data):
            db.session.add(self._create_workout_day_exercise(workout_day.id, exercise_data))

    def get_active_plans(self, exclude_personalized: bool = True) -> list[WorkoutPlan]:
        stmt = select(WorkoutPlan).where(WorkoutPlan.is_active.is_(True))
        if exclude_personalized:
            stmt = stmt.where(WorkoutPlan.plan_type != "personalized")
        return list(db.session.scalars(stmt).all())

    def get_with_schedule(self, plan_id: uuid.UUID) -> WorkoutPlan | None:
        stmt = (
            select(WorkoutPlan)
            .where(WorkoutPlan.id == plan_id)
            .options(
                joinedload(WorkoutPlan.workout_days)
                .joinedload(WorkoutDay.exercises)
                .joinedload(WorkoutDayExercise.exercise)
            )
        )
        return cast(WorkoutPlan | None, db.session.scalars(stmt).unique().first())

    def get_one_day_plans(self) -> list[WorkoutPlan]:
        subq = (
            select(WorkoutDay.workout_plan_id)
            .group_by(WorkoutDay.workout_plan_id)
            .having(func.count(WorkoutDay.id) == 1)
        )
        stmt = (
            select(WorkoutPlan)
            .where(
                WorkoutPlan.is_active.is_(True),
                WorkoutPlan.id.in_(subq),
            )
            .options(
                joinedload(WorkoutPlan.workout_days)
                .joinedload(WorkoutDay.exercises)
                .joinedload(WorkoutDayExercise.exercise)
            )
        )
        return list(db.session.scalars(stmt).unique().all())

    def get_by_difficulty(self, difficulty: str) -> list[WorkoutPlan]:
        stmt = select(WorkoutPlan).where(
            WorkoutPlan.is_active.is_(True), WorkoutPlan.level == difficulty
        )
        return list(db.session.scalars(stmt).all())

    def soft_delete(self, plan_id: uuid.UUID) -> bool:
        plan = self.get_by_id(plan_id)
        if not plan:
            return False
        plan.is_active = False
        db.session.flush()
        return True

    def get_library_with_exercise_count(self) -> list[dict[str, Any]]:
        stmt = (
            select(
                WorkoutPlan.name.label("title"),
                WorkoutPlan.description,
                WorkoutPlan.image_url.label("image"),
                func.count(WorkoutDayExercise.id).label("workoutCount"),
            )
            .join(WorkoutDay, WorkoutDay.workout_plan_id == WorkoutPlan.id)
            .join(WorkoutDayExercise, WorkoutDayExercise.workout_day_id == WorkoutDay.id)
            .where(
                WorkoutPlan.is_active.is_(True),
                WorkoutPlan.plan_type != "personalized",
            )
            .group_by(WorkoutPlan.id)
        )
        rows = db.session.execute(stmt).all()
        return [
            {
                "title": r.title,
                "description": r.description,
                "image": r.image,
                "workoutCount": r.workoutCount,
            }
            for r in rows
        ]

    def replace_schedule(self, plan_id: uuid.UUID, days_data: list[dict[str, Any]]) -> None:
        plan = self.get_with_schedule(plan_id)
        if not plan:
            return
        for day in plan.workout_days:
            for wde in day.exercises:
                db.session.delete(wde)
            db.session.delete(day)
        db.session.flush()

        for day_data in days_data:
            self._append_day_schedule(plan_id, day_data)
        db.session.flush()

    def create_full_plan(
        self, plan_data: dict[str, Any], days_data: list[dict[str, Any]]
    ) -> WorkoutPlan:
        plan = WorkoutPlan(**plan_data)
        db.session.add(plan)
        db.session.flush()

        for day_data in days_data:
            self._append_day_schedule(plan.id, day_data)

        db.session.flush()
        return plan
