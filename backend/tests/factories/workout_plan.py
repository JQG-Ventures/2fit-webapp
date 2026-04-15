from __future__ import annotations

import factory

from app.models.workout_plan import WorkoutDay, WorkoutDayExercise, WorkoutPlan
from tests.factories.base import BaseFactory
from tests.factories.exercise import ExerciseFactory


class WorkoutPlanFactory(BaseFactory):
    class Meta:
        model = WorkoutPlan

    name = factory.Sequence(lambda n: f"Plan {n}")
    description = factory.LazyAttribute(lambda o: f"Description {o.name}")
    plan_type = "library"
    duration_weeks = 4
    price = 0.0
    image_url = "https://example.com/plan.png"
    video_url = "https://example.com/plan.mp4"
    level = "beginner"
    is_active = True


class WorkoutDayFactory(BaseFactory):
    class Meta:
        model = WorkoutDay

    workout_plan = factory.SubFactory(WorkoutPlanFactory)
    day_of_week = "Monday"
    sequence_day = factory.Sequence(lambda n: n + 1)


class WorkoutDayExerciseFactory(BaseFactory):
    class Meta:
        model = WorkoutDayExercise

    workout_day = factory.SubFactory(WorkoutDayFactory)
    exercise = factory.SubFactory(ExerciseFactory)
    sets = 3
    reps = 12
    rest_seconds = 60
