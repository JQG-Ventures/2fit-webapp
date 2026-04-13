"""Compose persisted object graphs for integration-style tests. Call inside ``app.app_context()``."""

from __future__ import annotations

from tests.factories.challenge import (
    ChallengeDayExerciseFactory,
    ChallengeDayFactory,
    ChallengeFactory,
)
from tests.factories.exercise import ExerciseFactory
from tests.factories.progress import (
    ActivePlanFactory,
    CompletedWorkoutFactory,
    SavedWorkoutFactory,
)
from tests.factories.user import UserFactory
from tests.factories.workout_plan import (
    WorkoutDayExerciseFactory,
    WorkoutDayFactory,
    WorkoutPlanFactory,
)


def create_plan_with_one_exercise():
    """Return ``(plan, day, exercise, wde)`` linked and flushed via Factory Boy."""
    plan = WorkoutPlanFactory.create()
    exercise = ExerciseFactory.create()
    day = WorkoutDayFactory.create(workout_plan=plan, sequence_day=1)
    wde = WorkoutDayExerciseFactory.create(workout_day=day, exercise=exercise)
    return plan, day, exercise, wde


def create_user_saved_plan_and_active():
    """Return ``(user, plan, saved, active_plan)`` for workout flow tests."""
    user = UserFactory.create()
    plan = WorkoutPlanFactory.create()
    saved = SavedWorkoutFactory.create(user=user, workout_plan=plan)
    active = ActivePlanFactory.create(user=user, workout_plan=plan)
    return user, plan, saved, active


def create_challenge_with_one_exercise():
    """Return ``(challenge, day, exercise, cde)``."""
    challenge = ChallengeFactory.create()
    exercise = ExerciseFactory.create()
    day = ChallengeDayFactory.create(challenge=challenge, sequence_day=1, name="Day 1")
    cde = ChallengeDayExerciseFactory.create(challenge_day=day, exercise=exercise)
    return challenge, day, exercise, cde


def create_user_with_completed_workout():
    """Return ``(user, plan, completed)`` sharing the same user/plan where possible."""
    user = UserFactory.create()
    plan = WorkoutPlanFactory.create()
    completed = CompletedWorkoutFactory.create(user=user, workout_plan=plan)
    return user, plan, completed
