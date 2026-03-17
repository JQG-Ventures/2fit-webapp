from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class ChallengeExerciseCreate(BaseModel):
    exercise_id: str
    sets: int
    reps: int
    rest_seconds: int


class ChallengeDayCreate(BaseModel):
    sequence_day: int
    name: str
    is_rest: bool
    exercises: list[ChallengeExerciseCreate] = []


class ChallengeCreate(BaseModel):
    name: str
    description: str = ""
    plan_type: str = "challenge"
    duration_days: int
    price: float = 0.0
    image_url: str = ""
    video_url: str = ""
    intensity: bool = True
    equipment: Optional[list[str]] = None
    category: list[str] = []
    workout_schedule: list[ChallengeDayCreate]
    level: str = "beginner"
    is_active: bool = True

    @field_validator("level")
    @classmethod
    def validate_level(cls, v: str) -> str:
        if v not in ("beginner", "intermediate", "advanced"):
            raise ValueError("Invalid level")
        return v


class ChallengeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_days: Optional[int] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    intensity: Optional[bool] = None
    equipment: Optional[list[str]] = None
    category: Optional[list[str]] = None
    workout_schedule: Optional[list[ChallengeDayCreate]] = None
    level: Optional[str] = None
    is_active: Optional[bool] = None


class ChallengeExerciseResponse(BaseModel):
    model_config = {"from_attributes": True}

    exercise_id: str
    sets: int
    reps: int
    rest_seconds: int
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    difficulty: Optional[str] = None
    category: Optional[str] = None
    muscle_group: Optional[list[str]] = None
    equipment: Optional[list[str]] = None


class ChallengeDayResponse(BaseModel):
    model_config = {"from_attributes": True}

    sequence_day: int
    name: str
    is_rest: bool
    exercises: list[ChallengeExerciseResponse] = []


class ChallengeResponse(BaseModel):
    model_config = {"from_attributes": True, "populate_by_name": True}

    id: str = Field(alias="_id")
    name: str
    description: str
    plan_type: str
    duration_days: int
    price: float
    image_url: str
    video_url: str
    intensity: bool
    equipment: Optional[list[str]] = None
    category: list[str]
    workout_schedule: list[ChallengeDayResponse] = []
    level: str
    is_active: bool

    @model_validator(mode="before")
    @classmethod
    def map_orm_fields(cls, data: Any) -> Any:
        if hasattr(data, "challenge_days"):
            days = []
            for day in data.challenge_days:
                exercises = []
                for cde in day.exercises:
                    ex_dict: dict[str, Any] = {
                        "exercise_id": str(cde.exercise_id),
                        "sets": cde.sets,
                        "reps": cde.reps,
                        "rest_seconds": cde.rest_seconds,
                    }
                    if cde.exercise:
                        ex_dict.update(
                            {
                                "name": cde.exercise.name,
                                "description": cde.exercise.description,
                                "image_url": cde.exercise.image_url,
                                "video_url": cde.exercise.video_url,
                                "difficulty": cde.exercise.difficulty,
                                "category": cde.exercise.category,
                                "muscle_group": cde.exercise.muscle_group,
                                "equipment": cde.exercise.equipment,
                            }
                        )
                    exercises.append(ex_dict)
                days.append(
                    {
                        "sequence_day": day.sequence_day,
                        "name": day.name,
                        "is_rest": day.is_rest,
                        "exercises": exercises,
                    }
                )
            return {
                "_id": str(data.id),
                "name": data.name,
                "description": data.description,
                "plan_type": data.plan_type,
                "duration_days": data.duration_days,
                "price": data.price,
                "image_url": data.image_url,
                "video_url": data.video_url,
                "intensity": data.intensity,
                "equipment": data.equipment,
                "category": data.category,
                "workout_schedule": days,
                "level": data.level,
                "is_active": data.is_active,
            }
        return data

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, v: object) -> str:
        return str(v)
