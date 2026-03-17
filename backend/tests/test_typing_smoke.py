"""Smoke tests for quality-enforced pure helpers."""

from app.services.user_workout_service import UserWorkoutService
from app.services.workout_plan_service import WorkoutPlanGenerator


def test_map_user_level_defaults_unknown_values_to_beginner() -> None:
    assert WorkoutPlanGenerator.map_user_level("unexpected") == "beginner"


def test_calculate_week_number_starts_first_week_at_one() -> None:
    start_date = "2026-03-01T00:00:00.000000"
    completed_date = "2026-03-03T00:00:00.000000"

    assert UserWorkoutService.calculate_week_number(start_date, completed_date) == 1
