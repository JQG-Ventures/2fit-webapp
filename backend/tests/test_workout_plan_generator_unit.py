"""Unit tests for ``WorkoutPlanGenerator`` (pure logic, seeded RNG where needed)."""

from __future__ import annotations

import random
import uuid
from types import SimpleNamespace
from unittest.mock import ANY, MagicMock, patch

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


def test_generate_day_routine_dedupes_overlapping_strength_exercises() -> None:
    random.seed(11)
    exercises = [
        SimpleNamespace(id="shared", muscle_group=["chest", "triceps"], category="strength"),
        SimpleNamespace(id="chest-only", muscle_group=["chest"], category="strength"),
        SimpleNamespace(id="triceps-only", muscle_group=["triceps"], category="strength"),
        SimpleNamespace(id="cardio-1", muscle_group=["chest"], category="cardio"),
    ]
    settings = {"sets": 3, "reps": [8, 10], "rest": 90}

    routine = WorkoutPlanGenerator.generate_day_routine(
        ["push"], exercises, settings, "beginner", cardio=True
    )

    exercise_ids = [row["exercise_id"] for row in routine]
    assert len(exercise_ids) == len(set(exercise_ids))


def test_dedupe_exercises_keeps_first_instance_per_id() -> None:
    first = SimpleNamespace(
        id="shared",
        muscle_group=["chest"],
        category="strength",
        marker="first",
    )
    duplicate = SimpleNamespace(
        id="shared", muscle_group=["back"], category="strength", marker="second"
    )
    unique = SimpleNamespace(id="unique", muscle_group=["legs"], category="strength", marker="only")

    deduped = WorkoutPlanGenerator._dedupe_exercises([first, duplicate, unique])

    assert deduped == [first, unique]


def test_expand_muscle_groups_preserves_order_without_duplicates() -> None:
    expanded = WorkoutPlanGenerator._expand_muscle_groups(["push", "upper_body"])

    assert expanded == ["chest", "shoulders", "triceps", "back", "arms"]


def test_sample_unique_candidates_handles_empty_and_zero_limit() -> None:
    candidates = [SimpleNamespace(id="a"), SimpleNamespace(id="b")]

    assert WorkoutPlanGenerator._sample_unique_candidates(candidates, 0, set()) == []
    assert WorkoutPlanGenerator._sample_unique_candidates(candidates, 2, {"a", "b"}) == []


def test_generate_day_routine_backfills_remaining_strength_slots() -> None:
    exercises = [
        SimpleNamespace(id="chest-1", muscle_group=["chest"], category="strength"),
        SimpleNamespace(id="shoulders-1", muscle_group=["shoulders"], category="strength"),
        SimpleNamespace(id="triceps-1", muscle_group=["triceps"], category="strength"),
        SimpleNamespace(id="chest-2", muscle_group=["chest"], category="strength"),
        SimpleNamespace(id="triceps-2", muscle_group=["triceps"], category="strength"),
    ]
    settings = {"sets": 3, "reps": [8], "rest": 90}

    with patch("app.services.workout_plan_service.random.randint", side_effect=[5, 1, 1, 1]):
        routine = WorkoutPlanGenerator.generate_day_routine(
            ["push"], exercises, settings, "beginner", cardio=False
        )

    exercise_ids = [row["exercise_id"] for row in routine]
    assert len(routine) == 5
    assert len(exercise_ids) == len(set(exercise_ids))


def test_get_intensity_settings_unknown_level_falls_back_to_beginner_shape() -> None:
    s = WorkoutPlanGenerator.get_intensity_settings("not-a-level", "muscle")
    assert s["sets"] == 2 and "reps" in s


def test_determine_plan_duration_default_goal() -> None:
    d = WorkoutPlanGenerator.determine_plan_duration("unknown_goal", "intermediate")
    assert d == 12


@patch("app.services.workout_plan_service.db.session.flush")
@patch("app.services.workout_plan_service.WorkoutPlanGenerator.set_active_plan_for_user")
@patch("app.services.workout_plan_service.WorkoutPlanRepository")
@patch("app.services.workout_plan_service.ExerciseRepository")
def test_generate_workout_plan_creates_and_activates(
    mock_ex_cls: MagicMock,
    mock_wp_cls: MagicMock,
    mock_set_active: MagicMock,
    _flush: MagicMock,
) -> None:
    random.seed(7)
    ex = SimpleNamespace(
        id=uuid.uuid4(),
        muscle_group=["chest", "back", "legs"],
        category="strength",
    )
    mock_ex_cls.return_value.get_active.return_value = [ex] * 25
    plan = SimpleNamespace(id=uuid.uuid4())
    mock_wp_cls.return_value.create_full_plan.return_value = plan
    uid = str(uuid.uuid4())
    WorkoutPlanGenerator.generate_workout_plan(
        uid,
        {
            "fitness_level": "beginner",
            "fitness_goal": "muscle",
            "available_days": ["monday", "tuesday"],
            "name": "Tester",
        },
    )
    mock_wp_cls.return_value.create_full_plan.assert_called_once()
    mock_set_active.assert_called_once_with(uid, str(plan.id), ANY, ANY)


@patch("app.services.workout_plan_service.db.session.flush")
@patch("app.services.workout_plan_service.ActivePlanRepository")
def test_set_active_plan_for_user_completes_existing_personalized(
    mock_ap_cls: MagicMock, _flush: MagicMock
) -> None:
    existing = SimpleNamespace(is_completed=False, plan_type="personalized")
    mock_ap_cls.return_value.get_by_user.return_value = [existing]
    uid = str(uuid.uuid4())
    pid = str(uuid.uuid4())
    WorkoutPlanGenerator.set_active_plan_for_user(uid, pid, "My Plan", 6)
    assert existing.is_completed is True
    mock_ap_cls.return_value.create.assert_called_once()


@patch("app.services.workout_plan_service.db.session.flush")
@patch("app.services.workout_plan_service.ActivePlanRepository")
def test_set_active_plan_for_user_propagates_repository_error(
    mock_ap_cls: MagicMock, _flush: MagicMock
) -> None:
    mock_ap_cls.return_value.get_by_user.return_value = []
    mock_ap_cls.return_value.create.side_effect = RuntimeError("db down")
    with pytest.raises(RuntimeError, match="db down"):
        WorkoutPlanGenerator.set_active_plan_for_user(str(uuid.uuid4()), str(uuid.uuid4()), "P", 4)
