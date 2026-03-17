from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.exercise import Exercise


class Challenge(BaseModel):
    __tablename__ = "challenges"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    plan_type: Mapped[str] = mapped_column(String(20), nullable=False, default="challenge")
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    image_url: Mapped[str] = mapped_column(Text, nullable=False, default="")
    video_url: Mapped[str] = mapped_column(Text, nullable=False, default="")
    intensity: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    equipment: Mapped[Optional[list]] = mapped_column(ARRAY(String), nullable=True)
    category: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])
    level: Mapped[str] = mapped_column(String(20), nullable=False, default="beginner")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    challenge_days: Mapped[list[ChallengeDay]] = relationship(
        back_populates="challenge", cascade="all, delete-orphan",
        order_by="ChallengeDay.sequence_day"
    )


class ChallengeDay(BaseModel):
    __tablename__ = "challenge_days"
    __table_args__ = (
        UniqueConstraint("challenge_id", "sequence_day", name="uq_challenge_day_sequence"),
    )

    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False
    )
    sequence_day: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    is_rest: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    challenge: Mapped[Challenge] = relationship(back_populates="challenge_days")
    exercises: Mapped[list[ChallengeDayExercise]] = relationship(
        back_populates="challenge_day", cascade="all, delete-orphan"
    )


class ChallengeDayExercise(BaseModel):
    __tablename__ = "challenge_day_exercises"
    __table_args__ = (
        UniqueConstraint("challenge_day_id", "exercise_id", name="uq_challenge_day_exercise"),
    )

    challenge_day_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("challenge_days.id", ondelete="CASCADE"), nullable=False
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False
    )
    sets: Mapped[int] = mapped_column(Integer, nullable=False)
    reps: Mapped[int] = mapped_column(Integer, nullable=False)
    rest_seconds: Mapped[int] = mapped_column(Integer, nullable=False)

    challenge_day: Mapped[ChallengeDay] = relationship(back_populates="exercises")
    exercise: Mapped[Exercise] = relationship()
