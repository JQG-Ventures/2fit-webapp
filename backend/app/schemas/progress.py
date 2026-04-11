from typing import Any

from pydantic import BaseModel

ExercisePayload = dict[str, Any]


class ExecutedExercise(BaseModel):
    exercise_id: str
    sets_completed: int
    reps_completed: list[int] = []
    duration_seconds: int
    calories_burned: float
    is_completed: bool = True


class CompletedWorkoutCreate(BaseModel):
    workout_id: str
    date: str = ""
    duration_seconds: int
    calories_burned: float
    exercises: list[ExecutedExercise]
    day_of_week: str | None = None
    sequence_day: int | None = None
    was_skipped: bool = False


class ProgressUpdate(BaseModel):
    date: str = ""
    exercises: list[ExecutedExercise]
    day_of_week: str | None = None
    sequence_day: int | None = None


class ChallengeProgressUpdate(BaseModel):
    sequence_day: int
    date: str = ""
    exercises: list[ExecutedExercise]


class CompletedChallengeCreate(BaseModel):
    challenge_id: str
    sequence_day: int
    date: str = ""
    duration_seconds: int = 0
    calories_burned: float = 0.0
    exercises: list[ExecutedExercise]
    was_skipped: bool = False


class ProgressResponse(BaseModel):
    progress: float
    exercises_left: list[ExercisePayload] = []


class WeeklyDayProgress(BaseModel):
    day_of_week: str
    date: str
    is_completed: bool
    exercises: list[ExercisePayload] = []


class WeeklyProgressResponse(BaseModel):
    week_start_date: str
    week_end_date: str
    progress: float
    days: list[WeeklyDayProgress] = []


class ChallengeDayProgressResponse(BaseModel):
    sequence_day: int
    date: str
    is_completed: bool
    status: str
    exercises: list[ExercisePayload] = []


class ChallengeProgressResponse(BaseModel):
    challenge_id: str
    name: str
    total_days: int
    progress: float
    days: list[ChallengeDayProgressResponse] = []


class ActivePlanResponse(BaseModel):
    id: str
    type: str
    name: str
    plan_type: str
