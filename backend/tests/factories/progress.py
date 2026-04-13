from __future__ import annotations

from datetime import UTC, datetime

import factory

from app.models.progress import (
    ActiveChallenge,
    ActiveChallengeExercise,
    ActivePlan,
    CompletedChallengeDay,
    CompletedChallengeExercise,
    CompletedWorkout,
    CompletedWorkoutExercise,
    DayProgress,
    ExerciseProgress,
    SavedWorkout,
)
from tests.factories.base import BaseFactory
from tests.factories.challenge import ChallengeFactory
from tests.factories.exercise import ExerciseFactory
from tests.factories.user import UserFactory
from tests.factories.workout_plan import WorkoutPlanFactory

_utc = UTC


class SavedWorkoutFactory(BaseFactory):
    class Meta:
        model = SavedWorkout

    user = factory.SubFactory(UserFactory)
    workout_plan = factory.SubFactory(WorkoutPlanFactory)


class ActivePlanFactory(BaseFactory):
    class Meta:
        model = ActivePlan

    user = factory.SubFactory(UserFactory)
    workout_plan = factory.SubFactory(WorkoutPlanFactory)
    workout_name = factory.LazyAttribute(lambda o: o.workout_plan.name)
    plan_type = factory.LazyAttribute(lambda o: o.workout_plan.plan_type)
    start_date = factory.LazyFunction(lambda: datetime(2024, 1, 1, 12, 0, 0, tzinfo=_utc))
    end_date = None
    is_completed = False
    progress = 0.0


class DayProgressFactory(BaseFactory):
    class Meta:
        model = DayProgress

    active_plan = factory.SubFactory(ActivePlanFactory)
    week_number = 1
    day_of_week = "Monday"
    sequence_day = 1
    is_completed = False


class ExerciseProgressFactory(BaseFactory):
    class Meta:
        model = ExerciseProgress

    day_progress = factory.SubFactory(DayProgressFactory)
    exercise = factory.SubFactory(ExerciseFactory)
    sets_completed = 0
    reps_completed = factory.LazyFunction(list)
    duration_seconds = 0
    calories_burned = 0.0
    is_completed = False


class CompletedWorkoutFactory(BaseFactory):
    class Meta:
        model = CompletedWorkout

    user = factory.SubFactory(UserFactory)
    workout_plan = factory.SubFactory(WorkoutPlanFactory)
    date = factory.LazyFunction(lambda: datetime(2024, 1, 15, 10, 0, 0, tzinfo=_utc))
    duration_seconds = 1800
    calories_burned = 200.0
    day_of_week = "Monday"
    sequence_day = 1
    was_skipped = False


class CompletedWorkoutExerciseFactory(BaseFactory):
    class Meta:
        model = CompletedWorkoutExercise

    completed_workout = factory.SubFactory(CompletedWorkoutFactory)
    exercise = factory.SubFactory(ExerciseFactory)
    sets_completed = 3
    reps_completed = factory.LazyFunction(lambda: [10, 10, 10])
    duration_seconds = 300
    calories_burned = 50.0
    is_completed = True


class ActiveChallengeFactory(BaseFactory):
    class Meta:
        model = ActiveChallenge

    user = factory.SubFactory(UserFactory)
    challenge = factory.SubFactory(ChallengeFactory)
    date = factory.LazyFunction(lambda: datetime(2024, 1, 1, 8, 0, 0, tzinfo=_utc))
    sequence_day = 1


class ActiveChallengeExerciseFactory(BaseFactory):
    class Meta:
        model = ActiveChallengeExercise

    active_challenge = factory.SubFactory(ActiveChallengeFactory)
    exercise = factory.SubFactory(ExerciseFactory)
    sets_completed = 0
    reps_completed = factory.LazyFunction(list)
    duration_seconds = 0
    calories_burned = 0.0
    is_completed = False


class CompletedChallengeDayFactory(BaseFactory):
    class Meta:
        model = CompletedChallengeDay

    user = factory.SubFactory(UserFactory)
    challenge = factory.SubFactory(ChallengeFactory)
    sequence_day = 1
    date = factory.LazyFunction(lambda: datetime(2024, 1, 2, 9, 0, 0, tzinfo=_utc))
    duration_seconds = 1200
    calories_burned = 150.0
    was_skipped = False


class CompletedChallengeExerciseFactory(BaseFactory):
    class Meta:
        model = CompletedChallengeExercise

    completed_challenge_day = factory.SubFactory(CompletedChallengeDayFactory)
    exercise = factory.SubFactory(ExerciseFactory)
    sets_completed = 3
    reps_completed = factory.LazyFunction(lambda: [12, 12, 12])
    duration_seconds = 400
    calories_burned = 60.0
    is_completed = True
