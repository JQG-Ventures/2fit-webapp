from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class TrainingPreferencesCreate(BaseModel):
    preferred_muscle_groups: list[str] = []
    equipment: list[str] = []
    available_days: list[str]
    workout_types: list[str]

    @field_validator("available_days", mode="before")
    @classmethod
    def validate_days(cls, v: list[str]) -> list[str]:
        valid = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}
        for day in v:
            if day not in valid:
                raise ValueError(f"Invalid day: {day}")
        return v


class PreferencesCreate(BaseModel):
    water_consumption: Optional[float] = None
    dietary_restrictions: list[str] = []
    dietary_goals: Optional[str] = None
    preferences: list[str] = []


class NotificationsSettings(BaseModel):
    general: bool = True
    updates: bool = True
    services: bool = True
    tips: bool = True
    bot: bool = True
    reminders: bool = True


class SecuritySettings(BaseModel):
    face_id: bool = True
    remember_me: bool = True
    touch_id: bool = True


class SettingsCreate(BaseModel):
    notifications: NotificationsSettings = NotificationsSettings()
    nutrition_enabled: bool = False
    language_preference: str = "es"
    security_settings: SecuritySettings = SecuritySettings()


class AutomationDataCreate(BaseModel):
    profile_complete: bool = False
    message_sent: bool = False
    greetings_sent: bool = False
    created_by_bot: bool = False
    last_motivational_message: Optional[str] = None


class UserCreate(BaseModel):
    name: str
    last: str
    age: int
    birthdate: str
    code_number: str = ""
    country: str
    number: str
    gender: str
    email: str
    password: Optional[str] = None
    roles: list[str] = ["user"]
    height: int
    weight: int
    target_weight: int
    profile_image: str = ""
    auth_provider: str = "default"
    fitness_goal: str
    fitness_level: str
    training_preferences: TrainingPreferencesCreate
    preferences: PreferencesCreate = PreferencesCreate()
    settings: SettingsCreate = SettingsCreate()
    automation_data: AutomationDataCreate = AutomationDataCreate()

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        if v not in ("m", "f"):
            raise ValueError("Gender must be 'm' or 'f'")
        return v

    @field_validator("auth_provider")
    @classmethod
    def validate_auth_provider(cls, v: str) -> str:
        if v not in ("default", "google", "meta", "apple"):
            raise ValueError("Invalid auth provider")
        return v

    @field_validator("fitness_goal")
    @classmethod
    def validate_fitness_goal(cls, v: str) -> str:
        if v not in ("weight", "keep", "strength", "muscle"):
            raise ValueError("Invalid fitness goal")
        return v

    @field_validator("fitness_level")
    @classmethod
    def validate_fitness_level(cls, v: str) -> str:
        if v not in ("beginner", "irregular", "intermediate", "advanced"):
            raise ValueError("Invalid fitness level")
        return v

    @model_validator(mode="after")
    def validate_password_required_for_default(self) -> UserCreate:
        if self.auth_provider == "default":
            if not self.password or not self.password.strip():
                raise ValueError("Password is required for default auth provider")
        return self


class UserUpdate(BaseModel):
    name: Optional[str] = None
    last: Optional[str] = None
    age: Optional[int] = None
    birthdate: Optional[str] = None
    country: Optional[str] = None
    number: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    target_weight: Optional[int] = None
    profile_image: Optional[str] = None
    fitness_goal: Optional[str] = None
    fitness_level: Optional[str] = None
    preferred_muscle_groups: Optional[list[str]] = None
    equipment: Optional[list[str]] = None
    available_days: Optional[list[str]] = None
    workout_types: Optional[list[str]] = None


class UserResponse(BaseModel):
    model_config = {"from_attributes": True, "populate_by_name": True}

    id: str = Field(alias="_id")
    name: str
    last: str
    age: int
    birthdate: str
    code_number: str
    country: str
    number: str
    gender: str
    email: str
    roles: list[str]
    height: int
    weight: int
    target_weight: int
    profile_image: str
    auth_provider: str
    fitness_goal: str
    fitness_level: str
    preferred_muscle_groups: list[str] = []
    equipment: list[str] = []
    available_days: list[str] = []
    workout_types: list[str] = []

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, v: object) -> str:
        return str(v)

    @field_validator("birthdate", mode="before")
    @classmethod
    def stringify_birthdate(cls, v: object) -> str:
        if isinstance(v, (date, datetime)):
            return v.isoformat()
        return str(v)
