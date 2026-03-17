from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.challenge import Challenge
    from app.models.exercise import Exercise
    from app.models.user import User
    from app.models.workout_plan import WorkoutPlan


class SavedWorkout(BaseModel):
    __tablename__ = "saved_workouts"
    __table_args__ = (
        UniqueConstraint("user_id", "workout_plan_id", name="uq_saved_workout_user_plan"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    workout_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="saved_workouts")
    workout_plan: Mapped[WorkoutPlan] = relationship()


class ActivePlan(BaseModel):
    __tablename__ = "active_plans"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    workout_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False
    )
    workout_name: Mapped[str] = mapped_column(String(200), nullable=False)
    plan_type: Mapped[str] = mapped_column(String(20), nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    progress: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    user: Mapped[User] = relationship(back_populates="active_plans")
    workout_plan: Mapped[WorkoutPlan] = relationship()
    progress_details: Mapped[list[DayProgress]] = relationship(
        back_populates="active_plan", cascade="all, delete-orphan"
    )


class DayProgress(BaseModel):
    __tablename__ = "day_progress"

    active_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("active_plans.id", ondelete="CASCADE"), nullable=False
    )
    week_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    day_of_week: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    sequence_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    active_plan: Mapped[ActivePlan] = relationship(back_populates="progress_details")
    exercises: Mapped[list[ExerciseProgress]] = relationship(
        back_populates="day_progress", cascade="all, delete-orphan"
    )


class ExerciseProgress(BaseModel):
    __tablename__ = "exercise_progress"
    __table_args__ = (
        UniqueConstraint("day_progress_id", "exercise_id", name="uq_exercise_progress_day_exercise"),
    )

    day_progress_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("day_progress.id", ondelete="CASCADE"), nullable=False
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False
    )
    sets_completed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reps_completed: Mapped[list] = mapped_column(ARRAY(Integer), nullable=False, default=[])
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    calories_burned: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    day_progress: Mapped[DayProgress] = relationship(back_populates="exercises")
    exercise: Mapped[Exercise] = relationship()


class CompletedWorkout(BaseModel):
    __tablename__ = "completed_workouts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    workout_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="SET NULL"), nullable=True
    )
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    calories_burned: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    day_of_week: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    sequence_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    was_skipped: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped[User] = relationship(back_populates="completed_workouts")
    workout_plan: Mapped[Optional[WorkoutPlan]] = relationship()
    exercises: Mapped[list[CompletedWorkoutExercise]] = relationship(
        back_populates="completed_workout", cascade="all, delete-orphan"
    )


class CompletedWorkoutExercise(BaseModel):
    __tablename__ = "completed_workout_exercises"

    completed_workout_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("completed_workouts.id", ondelete="CASCADE"), nullable=False
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False
    )
    sets_completed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reps_completed: Mapped[list] = mapped_column(ARRAY(Integer), nullable=False, default=[])
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    calories_burned: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    completed_workout: Mapped[CompletedWorkout] = relationship(back_populates="exercises")
    exercise: Mapped[Exercise] = relationship()


class ActiveChallenge(BaseModel):
    __tablename__ = "active_challenges"
    __table_args__ = (
        UniqueConstraint("user_id", "challenge_id", name="uq_active_challenge_user"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sequence_day: Mapped[int] = mapped_column(Integer, nullable=False)

    user: Mapped[User] = relationship(back_populates="active_challenges")
    challenge: Mapped[Challenge] = relationship()
    exercises: Mapped[list[ActiveChallengeExercise]] = relationship(
        back_populates="active_challenge", cascade="all, delete-orphan"
    )


class ActiveChallengeExercise(BaseModel):
    __tablename__ = "active_challenge_exercises"

    active_challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("active_challenges.id", ondelete="CASCADE"), nullable=False
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False
    )
    sets_completed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reps_completed: Mapped[list] = mapped_column(ARRAY(Integer), nullable=False, default=[])
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    calories_burned: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    active_challenge: Mapped[ActiveChallenge] = relationship(back_populates="exercises")
    exercise: Mapped[Exercise] = relationship()


class CompletedChallengeDay(BaseModel):
    __tablename__ = "completed_challenge_days"
    __table_args__ = (
        UniqueConstraint("user_id", "challenge_id", "sequence_day", name="uq_completed_challenge_day"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False
    )
    sequence_day: Mapped[int] = mapped_column(Integer, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    calories_burned: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    was_skipped: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped[User] = relationship(back_populates="completed_challenge_days")
    challenge: Mapped[Challenge] = relationship()
    exercises: Mapped[list[CompletedChallengeExercise]] = relationship(
        back_populates="completed_challenge_day", cascade="all, delete-orphan"
    )


class CompletedChallengeExercise(BaseModel):
    __tablename__ = "completed_challenge_exercises"

    completed_challenge_day_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("completed_challenge_days.id", ondelete="CASCADE"),
        nullable=False
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False
    )
    sets_completed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reps_completed: Mapped[list] = mapped_column(ARRAY(Integer), nullable=False, default=[])
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    calories_burned: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    completed_challenge_day: Mapped[CompletedChallengeDay] = relationship(
        back_populates="exercises"
    )
    exercise: Mapped[Exercise] = relationship()
