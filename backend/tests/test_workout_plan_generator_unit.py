"""Unit tests for ``WorkoutPlanGenerator`` (pure logic, seeded RNG where needed)."""

from __future__ import annotations

import random
from types import SimpleNamespace

import pytest

from app.services.workout_plan_service import WorkoutPlanGenerator

pytestmark = pytest.mark.unit


def test_map_user_level_defaults_unknown_to_beginner() -> None:
    assert WorkoutPlanGenerator.map_user_level("irregular") == "beginner"
    assert WorkoutPlanGenerator.map_user_level("nosuch") == "beginner"
    assert WorkoutPlanGenerator.map_user_level("advanced") == "advanced"


@pytest.mark.parametrize(
    ("goal", "expected_keys"),
    [
        ("weight", "reps"),
        ("strength", "reps"),
        ("muscle", "reps"),
        ("keep", "reps"),
    ],
)
def test_get_intensity_settings_covers_fitness_goals(goal: str, expected_keys: str) -> None:
    s = WorkoutPlanGenerator.get_intensity_settings("intermediate", goal)
    assert "sets" in s and expected_keys in s and "rest" in s


def test_determine_plan_duration_caps_for_beginner() -> None:
    d = WorkoutPlanGenerator.determine_plan_duration("muscle", "beginner")
    assert d <= 8


def test_determine_plan_duration_raises_floor_for_advanced() -> None:
    d = WorkoutPlanGenerator.determine_plan_duration("keep", "advanced")
    assert d >= 12


def test_calculate_splits_length_by_availability() -> None:
    assert len(WorkoutPlanGenerator.calculate_splits(5, "muscle")) == 5
    assert len(WorkoutPlanGenerator.calculate_splits(4, "muscle")) == 4
    assert len(WorkoutPlanGenerator.calculate_splits(3, "muscle")) == 3


def test_generate_day_routine_respects_level_bounds() -> None:
    random.seed(42)
    exercises = [
        SimpleNamespace(
            id=f"e{i}",
            muscle_group=["chest", "back", "legs", "shoulders", "biceps", "triceps"],
            category="strength",
        )
        for i in range(30)
    ]
    settings = {"sets": 3, "reps": [8, 10], "rest": 90}
    routine = WorkoutPlanGenerator.generate_day_routine(
        ["chest", "back"], exercises, settings, "beginner", cardio=False
    )
    assert 1 <= len(routine) <= 6
    for row in routine:
        assert "exercise_id" in row and row["sets"] == settings["sets"]


def test_generate_day_routine_includes_cardio_when_requested() -> None:
    random.seed(1)
    mixed = [
        SimpleNamespace(id="c1", muscle_group=["legs"], category="cardio"),
        SimpleNamespace(id="s1", muscle_group=["chest"], category="strength"),
    ]
    settings = {"sets": 3, "reps": [8], "rest": 60}
    routine = WorkoutPlanGenerator.generate_day_routine(
        ["legs", "cardio"], mixed, settings, "intermediate", cardio=True
    )
    assert len(routine) >= 1
