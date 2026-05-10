"""Tests for ``WorkoutPlanRepository``."""

from __future__ import annotations

import pytest

from app.repositories.workout_repository import WorkoutPlanRepository
from tests.db_checks import postgres_reachable
from tests.factories import ExerciseFactory, WorkoutPlanFactory

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_get_active_plans_excludes_personalized(db) -> None:
    WorkoutPlanFactory.create(plan_type="library", is_active=True)
    WorkoutPlanFactory.create(plan_type="personalized", is_active=True)
    repo = WorkoutPlanRepository()
    plans = repo.get_active_plans(exclude_personalized=True)
    types = {p.plan_type for p in plans}
    assert "personalized" not in types


def test_get_with_schedule_loads_days_and_exercises(db, plan_with_one_exercise) -> None:
    repo = WorkoutPlanRepository()
    plan = repo.get_with_schedule(plan_with_one_exercise.plan.id)
    assert plan is not None
    assert len(plan.workout_days) >= 1
    assert len(plan.workout_days[0].exercises) >= 1


def test_get_one_day_plans_only_single_day_plans(db) -> None:
    ex = ExerciseFactory.create()
    repo = WorkoutPlanRepository()
    repo.create_full_plan(
        {
            "name": "One Day Only",
            "description": "",
            "plan_type": "library",
            "level": "beginner",
            "image_url": "",
            "video_url": "",
            "is_active": True,
        },
        [
            {
                "sequence_day": 1,
                "exercises": [
                    {
                        "exercise_id": str(ex.id),
                        "sets": 2,
                        "reps": 8,
                        "rest_seconds": 45,
                    }
                ],
            }
        ],
    )
    db.session.commit()
    one_day = repo.get_one_day_plans()
    assert any(p.name == "One Day Only" for p in one_day)


def test_get_by_difficulty(db) -> None:
    WorkoutPlanFactory.create(level="beginner", plan_type="library", is_active=True)
    repo = WorkoutPlanRepository()
    plans = repo.get_by_difficulty("beginner")
    assert len(plans) >= 1


def test_soft_delete(db, sample_workout_plan) -> None:
    pid = sample_workout_plan.id
    repo = WorkoutPlanRepository()
    assert repo.soft_delete(pid) is True
    db.session.commit()
    plan = repo.get_by_id(pid)
    assert plan is not None
    assert plan.is_active is False


def test_get_library_with_exercise_count(db, plan_with_one_exercise) -> None:
    repo = WorkoutPlanRepository()
    rows = repo.get_library_with_exercise_count()
    assert isinstance(rows, list)
    titles = {r["title"] for r in rows}
    assert plan_with_one_exercise.plan.name in titles


def test_create_full_plan_persists_schedule(db) -> None:
    ex = ExerciseFactory.create()
    repo = WorkoutPlanRepository()
    plan = repo.create_full_plan(
        {
            "name": "Full Plan",
            "description": "",
            "plan_type": "paid",
            "level": "intermediate",
            "image_url": "",
            "video_url": "",
            "is_active": True,
        },
        [
            {
                "day_of_week": "monday",
                "exercises": [
                    {
                        "exercise_id": str(ex.id),
                        "sets": 4,
                        "reps": 8,
                        "rest_seconds": 90,
                    }
                ],
            }
        ],
    )
    db.session.commit()
    loaded = repo.get_with_schedule(plan.id)
    assert loaded is not None
    assert loaded.name == "Full Plan"
    assert any(d.day_of_week == "monday" for d in loaded.workout_days)


def test_create_full_plan_dedupes_duplicate_day_exercises(db) -> None:
    ex = ExerciseFactory.create()
    repo = WorkoutPlanRepository()

    plan = repo.create_full_plan(
        {
            "name": "Deduped Plan",
            "description": "",
            "plan_type": "paid",
            "level": "beginner",
            "image_url": "",
            "video_url": "",
            "is_active": True,
        },
        [
            {
                "day_of_week": "monday",
                "exercises": [
                    {
                        "exercise_id": str(ex.id),
                        "sets": 3,
                        "reps": 12,
                        "rest_seconds": 45,
                    },
                    {
                        "exercise_id": str(ex.id),
                        "sets": 4,
                        "reps": 10,
                        "rest_seconds": 60,
                    },
                ],
            }
        ],
    )

    db.session.commit()
    loaded = repo.get_with_schedule(plan.id)
    assert loaded is not None
    assert len(loaded.workout_days) == 1
    assert len(loaded.workout_days[0].exercises) == 1
    exercise = loaded.workout_days[0].exercises[0]
    assert exercise.exercise_id == ex.id
    assert exercise.sets == 3
    assert exercise.reps == 12
    assert exercise.rest_seconds == 45


def test_replace_schedule(db, plan_with_one_exercise) -> None:
    ex2 = ExerciseFactory.create(name="Replacement")
    plan_id = plan_with_one_exercise.plan.id
    repo = WorkoutPlanRepository()
    repo.replace_schedule(
        plan_id,
        [
            {
                "sequence_day": 1,
                "exercises": [
                    {
                        "exercise_id": str(ex2.id),
                        "sets": 2,
                        "reps": 12,
                        "rest_seconds": 30,
                    }
                ],
            }
        ],
    )
    db.session.commit()
    loaded = repo.get_with_schedule(plan_id)
    assert loaded is not None
    wde = loaded.workout_days[0].exercises[0]
    assert wde.exercise_id == ex2.id


def test_replace_schedule_dedupes_duplicate_day_exercises(db, plan_with_one_exercise) -> None:
    ex2 = ExerciseFactory.create(name="Replacement Deduped")
    plan_id = plan_with_one_exercise.plan.id
    repo = WorkoutPlanRepository()

    repo.replace_schedule(
        plan_id,
        [
            {
                "sequence_day": 1,
                "exercises": [
                    {
                        "exercise_id": str(ex2.id),
                        "sets": 2,
                        "reps": 12,
                        "rest_seconds": 30,
                    },
                    {
                        "exercise_id": str(ex2.id),
                        "sets": 5,
                        "reps": 6,
                        "rest_seconds": 90,
                    },
                ],
            }
        ],
    )

    db.session.commit()
    loaded = repo.get_with_schedule(plan_id)
    assert loaded is not None
    assert len(loaded.workout_days) == 1
    assert len(loaded.workout_days[0].exercises) == 1
    exercise = loaded.workout_days[0].exercises[0]
    assert exercise.exercise_id == ex2.id
    assert exercise.sets == 2
    assert exercise.reps == 12
    assert exercise.rest_seconds == 30
