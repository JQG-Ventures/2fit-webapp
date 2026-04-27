import uuid
from typing import Any, cast

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.progress import (
    ActiveChallenge,
    ActiveChallengeExercise,
    ActivePlan,
    CompletedChallengeDay,
    CompletedChallengeExercise,
    CompletedWorkout,
    CompletedWorkoutExercise,
    DayProgress,
    ExerciseProgress,
    PlanSessionExerciseOverride,
    SavedWorkout,
)

Payload = dict[str, Any]


def _coerce_int(value: object, default: int = 0) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        try:
            return int(value)
        except ValueError:
            return default
    return default


def _coerce_float(value: object, default: float = 0.0) -> float:
    if isinstance(value, bool):
        return float(value)
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return default
    return default


class SavedWorkoutRepository:
    def get_by_user(self, user_id: uuid.UUID) -> list[SavedWorkout]:
        from app.models.workout_plan import WorkoutDay, WorkoutDayExercise, WorkoutPlan

        stmt = (
            select(SavedWorkout)
            .where(SavedWorkout.user_id == user_id)
            .options(
                joinedload(SavedWorkout.workout_plan)
                .joinedload(WorkoutPlan.workout_days)
                .joinedload(WorkoutDay.exercises)
                .joinedload(WorkoutDayExercise.exercise)
            )
        )
        return list(db.session.scalars(stmt).unique().all())

    def add(self, user_id: uuid.UUID, workout_plan_id: uuid.UUID) -> SavedWorkout:
        existing = cast(
            SavedWorkout | None,
            db.session.scalars(
                select(SavedWorkout).where(
                    SavedWorkout.user_id == user_id,
                    SavedWorkout.workout_plan_id == workout_plan_id,
                )
            ).first(),
        )
        if existing:
            return existing
        sw = SavedWorkout(user_id=user_id, workout_plan_id=workout_plan_id)
        db.session.add(sw)
        db.session.flush()
        return sw

    def remove(self, user_id: uuid.UUID, workout_plan_id: uuid.UUID) -> bool:
        sw = cast(
            SavedWorkout | None,
            db.session.scalars(
                select(SavedWorkout).where(
                    SavedWorkout.user_id == user_id,
                    SavedWorkout.workout_plan_id == workout_plan_id,
                )
            ).first(),
        )
        if not sw:
            return False
        db.session.delete(sw)
        db.session.flush()
        return True


class ActivePlanRepository:
    def get_by_user(self, user_id: uuid.UUID) -> list[ActivePlan]:
        stmt = (
            select(ActivePlan)
            .where(ActivePlan.user_id == user_id)
            .options(joinedload(ActivePlan.progress_details).joinedload(DayProgress.exercises))
        )
        return list(db.session.scalars(stmt).unique().all())

    def get_active_for_user(
        self, user_id: uuid.UUID, workout_plan_id: uuid.UUID
    ) -> ActivePlan | None:
        stmt = (
            select(ActivePlan)
            .where(
                ActivePlan.user_id == user_id,
                ActivePlan.workout_plan_id == workout_plan_id,
                ActivePlan.is_completed.is_(False),
            )
            .options(joinedload(ActivePlan.progress_details).joinedload(DayProgress.exercises))
        )
        return cast(ActivePlan | None, db.session.scalars(stmt).unique().first())

    def create(self, **kwargs: object) -> ActivePlan:
        plan = ActivePlan(**kwargs)
        db.session.add(plan)
        db.session.flush()
        return plan


class DayProgressRepository:
    def find_or_create(
        self,
        active_plan_id: uuid.UUID,
        week_number: int | None = None,
        day_of_week: str | None = None,
        sequence_day: int | None = None,
    ) -> DayProgress:
        filters = [DayProgress.active_plan_id == active_plan_id]
        if day_of_week:
            filters.append(DayProgress.day_of_week == day_of_week)
        if sequence_day is not None:
            filters.append(DayProgress.sequence_day == sequence_day)
        if week_number is not None:
            filters.append(DayProgress.week_number == week_number)

        existing = cast(
            DayProgress | None,
            db.session.scalars(select(DayProgress).where(*filters)).first(),
        )
        if existing:
            return existing

        dp = DayProgress(
            active_plan_id=active_plan_id,
            week_number=week_number,
            day_of_week=day_of_week,
            sequence_day=sequence_day,
        )
        db.session.add(dp)
        db.session.flush()
        return dp

    def add_exercise_progress(
        self, day_progress_id: uuid.UUID, exercise_id: uuid.UUID, **kwargs: object
    ) -> ExerciseProgress:
        existing = cast(
            ExerciseProgress | None,
            db.session.scalars(
                select(ExerciseProgress).where(
                    ExerciseProgress.day_progress_id == day_progress_id,
                    ExerciseProgress.exercise_id == exercise_id,
                )
            ).first(),
        )
        if existing:
            sets_new = _coerce_int(kwargs.get("sets_completed", 0))
            existing.sets_completed = max(existing.sets_completed, sets_new)

            reps_new = kwargs.get("reps_completed", [])
            if isinstance(reps_new, list):
                existing.reps_completed = existing.reps_completed + [
                    _coerce_int(rep) for rep in reps_new
                ]

            dur_new = _coerce_int(kwargs.get("duration_seconds", 0))
            existing.duration_seconds += dur_new

            cal_new = _coerce_float(kwargs.get("calories_burned", 0.0))
            existing.calories_burned += cal_new

            is_done = bool(kwargs.get("is_completed", False))
            existing.is_completed = existing.is_completed or is_done

            db.session.flush()
            return existing

        ep = ExerciseProgress(
            day_progress_id=day_progress_id,
            exercise_id=exercise_id,
            **kwargs,
        )
        db.session.add(ep)
        db.session.flush()
        return ep


class CompletedWorkoutRepository:
    def save(
        self, user_id: uuid.UUID, workout_data: Payload, exercises_data: list[Payload]
    ) -> CompletedWorkout:
        cw = CompletedWorkout(user_id=user_id, **workout_data)
        db.session.add(cw)
        db.session.flush()

        for ex_data in exercises_data:
            ex_id = str(ex_data.pop("exercise_id"))
            cwe = CompletedWorkoutExercise(
                completed_workout_id=cw.id,
                exercise_id=uuid.UUID(ex_id),
                **ex_data,
            )
            db.session.add(cwe)

        db.session.flush()
        return cw

    def get_by_user(self, user_id: uuid.UUID) -> list[CompletedWorkout]:
        stmt = (
            select(CompletedWorkout)
            .where(CompletedWorkout.user_id == user_id)
            .options(joinedload(CompletedWorkout.exercises))
        )
        return list(db.session.scalars(stmt).unique().all())


class ActiveChallengeRepository:
    def get_for_user(self, user_id: uuid.UUID, challenge_id: uuid.UUID) -> ActiveChallenge | None:
        stmt = (
            select(ActiveChallenge)
            .where(
                ActiveChallenge.user_id == user_id,
                ActiveChallenge.challenge_id == challenge_id,
            )
            .options(joinedload(ActiveChallenge.exercises))
        )
        return cast(ActiveChallenge | None, db.session.scalars(stmt).unique().first())

    def get_all_for_user(self, user_id: uuid.UUID) -> list[ActiveChallenge]:
        stmt = (
            select(ActiveChallenge)
            .where(ActiveChallenge.user_id == user_id)
            .options(
                joinedload(ActiveChallenge.exercises),
                joinedload(ActiveChallenge.challenge),
            )
        )
        return list(db.session.scalars(stmt).unique().all())

    def create(self, **kwargs: object) -> ActiveChallenge:
        ac = ActiveChallenge(**kwargs)
        db.session.add(ac)
        db.session.flush()
        return ac

    def add_exercise(
        self, active_challenge_id: uuid.UUID, exercise_id: uuid.UUID, **kwargs: object
    ) -> ActiveChallengeExercise:
        ace = ActiveChallengeExercise(
            active_challenge_id=active_challenge_id,
            exercise_id=exercise_id,
            **kwargs,
        )
        db.session.add(ace)
        db.session.flush()
        return ace


class CompletedChallengeDayRepository:
    def save(
        self,
        user_id: uuid.UUID,
        challenge_id: uuid.UUID,
        day_data: Payload,
        exercises_data: list[Payload],
    ) -> CompletedChallengeDay:
        ccd = CompletedChallengeDay(
            user_id=user_id,
            challenge_id=challenge_id,
            **day_data,
        )
        db.session.add(ccd)
        db.session.flush()

        for ex_data in exercises_data:
            ex_id = str(ex_data.pop("exercise_id"))
            cce = CompletedChallengeExercise(
                completed_challenge_day_id=ccd.id,
                exercise_id=uuid.UUID(ex_id),
                **ex_data,
            )
            db.session.add(cce)

        db.session.flush()
        return ccd

    def get_by_user_challenge(
        self, user_id: uuid.UUID, challenge_id: uuid.UUID
    ) -> list[CompletedChallengeDay]:
        stmt = (
            select(CompletedChallengeDay)
            .where(
                CompletedChallengeDay.user_id == user_id,
                CompletedChallengeDay.challenge_id == challenge_id,
            )
            .options(joinedload(CompletedChallengeDay.exercises))
        )
        return list(db.session.scalars(stmt).unique().all())


class PlanSessionExerciseOverrideRepository:
    def list_for_plan_and_week(
        self, active_plan_id: uuid.UUID, week_number: int
    ) -> list[PlanSessionExerciseOverride]:
        stmt = select(PlanSessionExerciseOverride).where(
            PlanSessionExerciseOverride.active_plan_id == active_plan_id,
            PlanSessionExerciseOverride.week_number == week_number,
        )
        return list(db.session.scalars(stmt).all())

    def delete_by_source_exercise(
        self,
        active_plan_id: uuid.UUID,
        day_of_week: str,
        source_exercise_id: uuid.UUID,
    ) -> int:
        day_key = day_of_week.lower()
        rows = list(
            db.session.scalars(
                select(PlanSessionExerciseOverride).where(
                    PlanSessionExerciseOverride.active_plan_id == active_plan_id,
                    PlanSessionExerciseOverride.day_of_week == day_key,
                    PlanSessionExerciseOverride.source_exercise_id == source_exercise_id,
                )
            ).all()
        )
        for row in rows:
            db.session.delete(row)
        return len(rows)

    def upsert_remove(
        self,
        active_plan_id: uuid.UUID,
        week_number: int,
        day_of_week: str,
        source_exercise_id: uuid.UUID,
    ) -> PlanSessionExerciseOverride:
        day_key = day_of_week.lower()
        existing = cast(
            PlanSessionExerciseOverride | None,
            db.session.scalars(
                select(PlanSessionExerciseOverride).where(
                    PlanSessionExerciseOverride.active_plan_id == active_plan_id,
                    PlanSessionExerciseOverride.week_number == week_number,
                    PlanSessionExerciseOverride.day_of_week == day_key,
                    PlanSessionExerciseOverride.source_exercise_id == source_exercise_id,
                )
            ).first(),
        )
        if existing:
            existing.action = "remove"
            existing.replacement_exercise_id = None
            db.session.flush()
            return existing
        override = PlanSessionExerciseOverride(
            active_plan_id=active_plan_id,
            week_number=week_number,
            day_of_week=day_key,
            action="remove",
            source_exercise_id=source_exercise_id,
            replacement_exercise_id=None,
        )
        db.session.add(override)
        db.session.flush()
        return override

    def upsert_replace(
        self,
        active_plan_id: uuid.UUID,
        week_number: int,
        day_of_week: str,
        source_exercise_id: uuid.UUID,
        replacement_exercise_id: uuid.UUID,
    ) -> PlanSessionExerciseOverride:
        day_key = day_of_week.lower()
        existing = cast(
            PlanSessionExerciseOverride | None,
            db.session.scalars(
                select(PlanSessionExerciseOverride).where(
                    PlanSessionExerciseOverride.active_plan_id == active_plan_id,
                    PlanSessionExerciseOverride.week_number == week_number,
                    PlanSessionExerciseOverride.day_of_week == day_key,
                    PlanSessionExerciseOverride.source_exercise_id == source_exercise_id,
                )
            ).first(),
        )
        if existing:
            existing.action = "replace"
            existing.replacement_exercise_id = replacement_exercise_id
            db.session.flush()
            return existing
        override = PlanSessionExerciseOverride(
            active_plan_id=active_plan_id,
            week_number=week_number,
            day_of_week=day_key,
            action="replace",
            source_exercise_id=source_exercise_id,
            replacement_exercise_id=replacement_exercise_id,
        )
        db.session.add(override)
        db.session.flush()
        return override
