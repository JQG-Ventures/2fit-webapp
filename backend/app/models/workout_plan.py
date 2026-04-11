from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.exercise import Exercise


class WorkoutPlan(BaseModel):
    __tablename__ = "workout_plans"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    plan_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    duration_weeks: Mapped[int | None] = mapped_column(Integer, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    image_url: Mapped[str] = mapped_column(Text, nullable=False, default="")
    video_url: Mapped[str] = mapped_column(Text, nullable=False, default="")
    level: Mapped[str] = mapped_column(String(20), nullable=False, default="beginner")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    workout_days: Mapped[list[WorkoutDay]] = relationship(
        back_populates="workout_plan",
        cascade="all, delete-orphan",
        order_by="WorkoutDay.sequence_day",
    )


class WorkoutDay(BaseModel):
    __tablename__ = "workout_days"

    workout_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False
    )
    day_of_week: Mapped[str | None] = mapped_column(String(10), nullable=True)
    sequence_day: Mapped[int | None] = mapped_column(Integer, nullable=True)

    workout_plan: Mapped[WorkoutPlan] = relationship(back_populates="workout_days")
    exercises: Mapped[list[WorkoutDayExercise]] = relationship(
        back_populates="workout_day", cascade="all, delete-orphan"
    )


class WorkoutDayExercise(BaseModel):
    __tablename__ = "workout_day_exercises"
    __table_args__ = (
        UniqueConstraint("workout_day_id", "exercise_id", name="uq_workout_day_exercise"),
    )

    workout_day_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workout_days.id", ondelete="CASCADE"), nullable=False
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False
    )
    sets: Mapped[int] = mapped_column(Integer, nullable=False)
    reps: Mapped[int] = mapped_column(Integer, nullable=False)
    rest_seconds: Mapped[int] = mapped_column(Integer, nullable=False)

    workout_day: Mapped[WorkoutDay] = relationship(back_populates="exercises")
    exercise: Mapped[Exercise] = relationship()
