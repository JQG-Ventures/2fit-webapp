from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Muscle(BaseModel):
    """Canonical muscle row — seeded from app.constants.muscle_taxonomy.MUSCLES_V1."""

    __tablename__ = "muscles"

    code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    body_region: Mapped[str] = mapped_column(String(16), nullable=False)
    visual_cluster: Mapped[str] = mapped_column(String(32), nullable=False)
    heatmap_slot: Mapped[str] = mapped_column(String(64), nullable=False)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)

    exercise_links: Mapped[list[ExerciseMuscle]] = relationship(
        back_populates="muscle", cascade="all, delete-orphan"
    )


class ExerciseMuscle(BaseModel):
    __tablename__ = "exercise_muscles"
    __table_args__ = (UniqueConstraint("exercise_id", "muscle_id", name="uq_exercise_muscle"),)

    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    muscle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("muscles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(16), nullable=False, default="primary")

    exercise: Mapped[object] = relationship("Exercise", back_populates="muscle_links")
    muscle: Mapped[Muscle] = relationship(back_populates="exercise_links")
