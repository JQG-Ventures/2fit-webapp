from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


class WorkoutExerciseCreate(BaseModel):
    exercise_id: str
    sets: int
    reps: int
    rest_seconds: int


class WorkoutDayCreate(BaseModel):
    day_of_week: str | None = None
    sequence_day: int | None = None
    exercises: list[WorkoutExerciseCreate]

    @model_validator(mode="after")
    def validate_day_identifier(self) -> "WorkoutDayCreate":
        if not self.day_of_week and self.sequence_day is None:
            raise ValueError("Either day_of_week or sequence_day must be provided.")
        return self


class WorkoutPlanCreate(BaseModel):
    name: str
    description: str = ""
    plan_type: str
    duration_weeks: int | None = None
    price: float | None = None
    image_url: str = ""
    video_url: str = ""
    workout_schedule: list[WorkoutDayCreate]
    level: str = "beginner"

    @field_validator("plan_type")
    @classmethod
    def validate_plan_type(cls, v: str) -> str:
        if v not in ("library", "paid", "personalized", "challenge"):
            raise ValueError("Invalid plan_type")
        return v

    @field_validator("level")
    @classmethod
    def validate_level(cls, v: str) -> str:
        if v not in ("beginner", "intermediate", "advanced"):
            raise ValueError("Invalid level")
        return v


class WorkoutPlanUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    plan_type: str | None = None
    duration_weeks: int | None = None
    price: float | None = None
    image_url: str | None = None
    video_url: str | None = None
    workout_schedule: list[WorkoutDayCreate] | None = None
    level: str | None = None
    is_active: bool | None = None


class WorkoutExerciseResponse(BaseModel):
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


class WorkoutDayResponse(BaseModel):
    model_config = {"from_attributes": True}

    day_of_week: str | None = None
    sequence_day: int | None = None
    exercises: list[WorkoutExerciseResponse] = []


class WorkoutPlanResponse(BaseModel):
    model_config = {"from_attributes": True, "populate_by_name": True}

    id: str = Field(alias="_id")
    name: str
    description: str
    plan_type: str
    duration_weeks: int | None = None
    price: float | None = None
    image_url: str
    video_url: str
    workout_schedule: list[WorkoutDayResponse] = []
    level: str
    is_active: bool

    @model_validator(mode="before")
    @classmethod
    def map_orm_fields(cls, data: Any) -> Any:
        if hasattr(data, "workout_days"):
            days = []
            for day in data.workout_days:
                exercises = []
                for wde in day.exercises:
                    ex_dict: dict[str, Any] = {
                        "exercise_id": str(wde.exercise_id),
                        "sets": wde.sets,
                        "reps": wde.reps,
                        "rest_seconds": wde.rest_seconds,
                    }
                    if wde.exercise:
                        ex_dict.update(
                            {
                                "name": wde.exercise.name,
                                "description": wde.exercise.description,
                                "image_url": wde.exercise.image_url,
                                "video_url": wde.exercise.video_url,
                                "difficulty": wde.exercise.difficulty,
                                "category": wde.exercise.category,
                                "muscle_group": wde.exercise.muscle_group,
                                "equipment": wde.exercise.equipment,
                            }
                        )
                    exercises.append(ex_dict)
                days.append(
                    {
                        "day_of_week": day.day_of_week,
                        "sequence_day": day.sequence_day,
                        "exercises": exercises,
                    }
                )
            return {
                "_id": str(data.id),
                "name": data.name,
                "description": data.description,
                "plan_type": data.plan_type,
                "duration_weeks": data.duration_weeks,
                "price": data.price,
                "image_url": data.image_url,
                "video_url": data.video_url,
                "workout_schedule": days,
                "level": data.level,
                "is_active": data.is_active,
            }
        return data

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, v: object) -> str:
        return str(v)


class WorkoutLibraryItem(BaseModel):
    title: str
    description: str
    image: str
    workoutCount: int
