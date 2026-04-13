"""HTTP tests for ``/api/workouts/*``."""

from __future__ import annotations

import uuid
from unittest.mock import patch

import pytest

from tests.db_checks import postgres_reachable
from tests.helpers.jwt_headers import auth_headers
from tests.support.workout_payload import workout_plan_create_dict

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_plans_get_unauthorized(client, db) -> None:
    r = client.get("/api/workouts/plans")
    assert r.status_code == 401


def test_plans_get_success(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/plans", headers=headers)
    assert r.status_code == 200
    assert r.get_json()["status"] == "success"


def test_plans_post_missing_body(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/workouts/plans", headers=headers)
    assert r.status_code == 415


def test_plans_post_creates_plan(app, client, db, sample_user, sample_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    payload = workout_plan_create_dict(str(sample_exercise.id))
    r = client.post("/api/workouts/plans", headers=headers, json=payload)
    assert r.status_code == 201
    body = r.get_json()
    assert body["status"] == "success"


def test_plan_get_not_found(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get(f"/api/workouts/plans/{uuid.uuid4()}", headers=headers)
    assert r.status_code == 404


def test_plan_get_success(app, client, db, sample_user, plan_with_one_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.get(f"/api/workouts/plans/{pid}", headers=headers)
    assert r.status_code == 200
    assert r.get_json()["message"]["name"] == plan_with_one_exercise.plan.name


def test_plan_delete_soft(app, client, db, sample_user, plan_with_one_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.delete(f"/api/workouts/plans/{pid}", headers=headers)
    assert r.status_code == 200


def test_one_day_plans_get(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/plans/one-day", headers=headers)
    assert r.status_code == 200


def test_saved_get_empty(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/saved", headers=headers)
    assert r.status_code == 200
    assert r.get_json()["message"] == []


def test_saved_post_missing_workout_id(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/workouts/saved", headers=headers)
    assert r.status_code == 415


def test_saved_post_and_delete(app, client, db, sample_user, sample_workout_plan) -> None:
    headers = auth_headers(app, str(sample_user.id))
    wid = str(sample_workout_plan.id)
    r = client.post(f"/api/workouts/saved?workout_id={wid}", headers=headers)
    assert r.status_code == 200
    r2 = client.delete(f"/api/workouts/saved?workout_id={wid}", headers=headers)
    assert r2.status_code == 200


def test_home_explore(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/home/explore", headers=headers)
    assert r.status_code == 200


def test_home_by_level_invalid(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/home/by-level?level=expert", headers=headers)
    assert r.status_code == 400


def test_home_by_level_all(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/home/by-level?level=all", headers=headers)
    assert r.status_code == 200


def test_library_not_found_or_success(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/library", headers=headers)
    assert r.status_code in (200, 404)


def test_library_difficulty_not_found(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/library/difficulty/advanced", headers=headers)
    assert r.status_code in (200, 404)


def test_popular_get(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/popular", headers=headers)
    assert r.status_code == 200


@patch("app.routes.workouts.UserWorkoutService.get_weekly_workout_progress")
def test_weekly_progress(mock_g, app, client, db, sample_user) -> None:
    mock_g.return_value = {"progress": 0.0, "days": []}
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/weekly-progress", headers=headers)
    assert r.status_code == 200


def test_challenge_progress_missing_id(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/challenge-progress", headers=headers)
    assert r.status_code == 400


@patch("app.routes.workouts.UserWorkoutService.get_challenge_progress")
def test_challenge_progress_ok(mock_c, app, client, db, sample_user) -> None:
    mock_c.return_value = {"completed": 0}
    headers = auth_headers(app, str(sample_user.id))
    cid = str(uuid.uuid4())
    r = client.get(f"/api/workouts/challenge-progress?challenge_id={cid}", headers=headers)
    assert r.status_code == 200


def test_delete_exercises_missing_body(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(f"/api/workouts/plans/{pid}/delete-exercises", headers=headers)
    assert r.status_code == 415


def test_update_exercises_missing_body(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(f"/api/workouts/plans/{pid}/update-exercises", headers=headers)
    assert r.status_code == 415


def test_plans_bulk_validation(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/workouts/plans/bulk", headers=headers, json=[{}])
    assert r.status_code == 400
