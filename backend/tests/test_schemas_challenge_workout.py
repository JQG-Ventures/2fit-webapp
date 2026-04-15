"""Pydantic validation for ``ChallengeCreate`` and workout plan schemas (lote 4)."""

from __future__ import annotations

import uuid

import pytest
from pydantic import ValidationError

from app.schemas.challenge import ChallengeCreate
from app.schemas.workout import WorkoutDayCreate, WorkoutPlanCreate

pytestmark = pytest.mark.unit


def test_challenge_create_rejects_invalid_level() -> None:
    with pytest.raises(ValidationError):
        ChallengeCreate(
            name="n",
            duration_days=1,
            level="expert",
            workout_schedule=[
                {
                    "sequence_day": 1,
                    "name": "D",
                    "is_rest": False,
                    "exercises": [],
                }
            ],
        )


def test_workout_plan_create_rejects_invalid_plan_type() -> None:
    with pytest.raises(ValidationError):
        WorkoutPlanCreate(
            name="p",
            plan_type="invalid",
            workout_schedule=[
                {
                    "day_of_week": "monday",
                    "exercises": [
                        {
                            "exercise_id": str(uuid.uuid4()),
                            "sets": 1,
                            "reps": 1,
                            "rest_seconds": 1,
                        }
                    ],
                }
            ],
        )


def test_workout_day_create_requires_day_or_sequence() -> None:
    with pytest.raises(ValidationError):
        WorkoutDayCreate(
            exercises=[
                {
                    "exercise_id": str(uuid.uuid4()),
                    "sets": 1,
                    "reps": 1,
                    "rest_seconds": 1,
                }
            ],
        )


def test_workout_plan_create_accepts_valid_payload() -> None:
    uid = str(uuid.uuid4())
    m = WorkoutPlanCreate(
        name="Plan",
        plan_type="library",
        workout_schedule=[
            {
                "sequence_day": 1,
                "exercises": [
                    {
                        "exercise_id": uid,
                        "sets": 2,
                        "reps": 10,
                        "rest_seconds": 60,
                    }
                ],
            }
        ],
    )
    assert m.level == "beginner"
