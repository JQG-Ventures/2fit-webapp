"""Tests for ``/api/users/workouts/*`` (mocked ``UserWorkoutService`` where needed)."""

from __future__ import annotations

import uuid
from unittest.mock import patch

import pytest

from tests.db_checks import postgres_reachable
from tests.helpers.jwt_headers import auth_headers

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


@patch("app.routes.users.UserWorkoutService.save_completed_workout")
def test_users_complete_workout_success(mock_save, app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    ex_id = str(uuid.uuid4())
    payload = {
        "workout_id": str(uuid.uuid4()),
        "duration_seconds": 120,
        "calories_burned": 50.0,
        "exercises": [
            {
                "exercise_id": ex_id,
                "sets_completed": 3,
                "reps_completed": [10, 10, 10],
                "duration_seconds": 120,
                "calories_burned": 50.0,
                "is_completed": True,
            }
        ],
    }
    r = client.post("/api/users/workouts/complete", headers=headers, json=payload)
    assert r.status_code == 200
    mock_save.assert_called_once()


@patch("app.routes.users.UserWorkoutService.get_user_progress")
def test_users_workout_progress_get_success(mock_get, app, client, db, sample_user) -> None:
    mock_get.return_value = {"progress": 0.5, "exercises_left": []}
    headers = auth_headers(app, str(sample_user.id))
    wid = str(uuid.uuid4())
    r = client.get(
        f"/api/users/workouts/progress?workout_plan_id={wid}",
        headers=headers,
    )
    assert r.status_code == 200
    assert r.get_json()["message"]["progress"] == 0.5


def test_users_workout_progress_get_missing_plan_id(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/users/workouts/progress", headers=headers)
    assert r.status_code == 400


@patch("app.routes.users.UserWorkoutService.save_workout_progress")
def test_users_workout_progress_post_success(mock_save, app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    wid = str(uuid.uuid4())
    ex_id = str(uuid.uuid4())
    payload = {
        "exercises": [
            {
                "exercise_id": ex_id,
                "sets_completed": 1,
                "reps_completed": [12],
                "duration_seconds": 60,
                "calories_burned": 10.0,
                "is_completed": True,
            }
        ]
    }
    r = client.post(
        f"/api/users/workouts/progress?workout_plan_id={wid}",
        headers=headers,
        json=payload,
    )
    assert r.status_code == 200
    mock_save.assert_called_once()


def test_users_workout_progress_post_empty_exercises(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    wid = str(uuid.uuid4())
    r = client.post(
        f"/api/users/workouts/progress?workout_plan_id={wid}",
        headers=headers,
        json={"exercises": []},
    )
    assert r.status_code == 400
