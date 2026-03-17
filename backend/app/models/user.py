from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.conversation import Conversation
    from app.models.notification import NotificationDevice
    from app.models.progress import (
        ActiveChallenge,
        ActivePlan,
        CompletedChallengeDay,
        CompletedWorkout,
        SavedWorkout,
    )


class User(BaseModel):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("code_number", "number", name="uq_user_code_number"),)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    last: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    birthdate: Mapped[date] = mapped_column(Date, nullable=False)
    code_number: Mapped[str] = mapped_column(String(10), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    gender: Mapped[str] = mapped_column(String(1), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    roles: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=["user"])
    height: Mapped[int] = mapped_column(Integer, nullable=False)
    weight: Mapped[int] = mapped_column(Integer, nullable=False)
    target_weight: Mapped[int] = mapped_column(Integer, nullable=False)
    profile_image: Mapped[str] = mapped_column(Text, nullable=False, default="")
    auth_provider: Mapped[str] = mapped_column(String(20), nullable=False, default="default")
    fitness_goal: Mapped[str] = mapped_column(String(20), nullable=False)
    fitness_level: Mapped[str] = mapped_column(String(20), nullable=False)

    preferred_muscle_groups: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])
    equipment: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])
    available_days: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])
    workout_types: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])

    preference: Mapped[Optional[UserPreference]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    settings: Mapped[Optional[UserSettings]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    automation_data: Mapped[Optional[UserAutomationData]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    saved_workouts: Mapped[list[SavedWorkout]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    active_plans: Mapped[list[ActivePlan]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    completed_workouts: Mapped[list[CompletedWorkout]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    active_challenges: Mapped[list[ActiveChallenge]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    completed_challenge_days: Mapped[list[CompletedChallengeDay]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    notification_devices: Mapped[list[NotificationDevice]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    conversations: Mapped[list[Conversation]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class UserPreference(BaseModel):
    __tablename__ = "user_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    water_consumption: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    dietary_restrictions: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])
    dietary_goals: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    preferences: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=[])

    user: Mapped[User] = relationship(back_populates="preference")


class UserSettings(BaseModel):
    __tablename__ = "user_settings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    notification_general: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notification_updates: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notification_services: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notification_tips: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notification_bot: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notification_reminders: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    nutrition_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    language_preference: Mapped[str] = mapped_column(String(10), nullable=False, default="es")
    security_face_id: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    security_remember_me: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    security_touch_id: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    user: Mapped[User] = relationship(back_populates="settings")


class UserAutomationData(BaseModel):
    __tablename__ = "user_automation_data"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    profile_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    message_sent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    greetings_sent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_by_bot: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_motivational_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship(back_populates="automation_data")
