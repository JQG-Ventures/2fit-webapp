from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator, model_validator

from app.constants.weekdays import is_valid_weekday, normalize_weekday


class TrainingPreferencesCreate(BaseModel):
    preferred_muscle_groups: list[str] = []
    equipment: list[str] = []
    available_days: list[str]
    workout_types: list[str]

    @field_validator("available_days", mode="before")
    @classmethod
    def validate_days(cls, v: list[str]) -> list[str]:
        normalized = [normalize_weekday(day) for day in v]
        for day in normalized:
            if not is_valid_weekday(day):
                raise ValueError(f"Invalid day: {day}")
        return normalized


class PreferencesCreate(BaseModel):
    water_consumption: float | None = None
    dietary_restrictions: list[str] = []
    dietary_goals: str | None = None
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
    last_motivational_message: str | None = None


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
    password: str | None = None
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
    def validate_password_required_for_default(self) -> "UserCreate":
        if self.auth_provider == "default":
            if not self.password or not self.password.strip():
                raise ValueError("Password is required for default auth provider")
        return self


class UserUpdate(BaseModel):
    name: str | None = None
    last: str | None = None
    age: int | None = None
    birthdate: str | None = None
    country: str | None = None
    number: str | None = None
    gender: str | None = None
    email: str | None = None
    height: int | None = None
    weight: int | None = None
    target_weight: int | None = None
    profile_image: str | None = None
    fitness_goal: str | None = None
    fitness_level: str | None = None
    preferred_muscle_groups: list[str] | None = None
    equipment: list[str] | None = None
    available_days: list[str] | None = None
    workout_types: list[str] | None = None


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
