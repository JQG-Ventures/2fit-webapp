from typing import Any

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
    equipment: list[str] | None = None
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
    name: str | None = None
    description: str | None = None
    duration_days: int | None = None
    price: float | None = None
    image_url: str | None = None
    video_url: str | None = None
    intensity: bool | None = None
    equipment: list[str] | None = None
    category: list[str] | None = None
    workout_schedule: list[ChallengeDayCreate] | None = None
    level: str | None = None
    is_active: bool | None = None


class ChallengeExerciseResponse(BaseModel):
    model_config = {"from_attributes": True}

    exercise_id: str
    sets: int
    reps: int
    rest_seconds: int
    name: str | None = None
    description: str | None = None
    image_url: str | None = None
    video_url: str | None = None
    difficulty: str | None = None
    category: str | None = None
    muscle_group: list[str] | None = None
    equipment: list[str] | None = None


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
    equipment: list[str] | None = None
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
