from __future__ import annotations

from sqlalchemy import Boolean, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class Exercise(BaseModel):
    __tablename__ = "exercises"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False, default="")
    video_url: Mapped[str] = mapped_column(Text, nullable=False, default="")
    muscle_group: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False, default="beginner")
    equipment: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])
    instructions: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])
    contradictions: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
