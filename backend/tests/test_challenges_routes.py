"""HTTP tests for ``/api/challenges/challenges`` and related challenge endpoints."""

from __future__ import annotations

import uuid
from unittest.mock import patch

import pytest

from tests.db_checks import postgres_reachable
from tests.helpers.jwt_headers import auth_headers
from tests.support.challenge_payload import challenge_create_dict

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]

BASE = "/api/challenges/challenges"


def test_challenge_list_returns_success(client, db) -> None:
    r = client.get(BASE)
    assert r.status_code == 200
    assert r.get_json()["status"] == "success"


def test_challenge_get_not_found(client, db) -> None:
    r = client.get(f"{BASE}/{uuid.uuid4()}")
    assert r.status_code == 404


def test_challenge_get_success(client, db, sample_exercise) -> None:
    payload = challenge_create_dict(str(sample_exercise.id), name_suffix="get")
    c = client.post(BASE, json=payload)
    assert c.status_code == 201
    cid = c.get_json()["message"]
    r = client.get(f"{BASE}/{cid}")
    assert r.status_code == 200
    assert r.get_json()["message"]["name"] == payload["name"]


def test_challenge_post_validation_error(client, db) -> None:
    r = client.post(
        BASE,
        json={
            "name": "X",
            "description": "",
            "duration_days": 1,
            "level": "expert",
            "workout_schedule": [],
        },
    )
    assert r.status_code == 400


def test_challenge_post_creates(client, db, sample_exercise) -> None:
    payload = challenge_create_dict(str(sample_exercise.id), name_suffix="post")
    r = client.post(BASE, json=payload)
    assert r.status_code == 201
    assert uuid.UUID(r.get_json()["message"])


def test_challenge_put_not_found(client, db, sample_exercise) -> None:
    payload = challenge_create_dict(str(sample_exercise.id), name_suffix="put404")
    r = client.put(f"{BASE}/{uuid.uuid4()}", json=payload)
    assert r.status_code == 404


def test_challenge_put_updates(client, db, sample_exercise) -> None:
    payload = challenge_create_dict(str(sample_exercise.id), name_suffix="putok")
    c = client.post(BASE, json=payload)
    cid = c.get_json()["message"]
    payload["name"] = "Updated Challenge Name"
    r = client.put(f"{BASE}/{cid}", json=payload)
    assert r.status_code == 200
    g = client.get(f"{BASE}/{cid}")
    assert g.get_json()["message"]["name"] == "Updated Challenge Name"


def test_challenge_delete_not_found(client, db) -> None:
    r = client.delete(f"{BASE}/{uuid.uuid4()}")
    assert r.status_code == 404


def test_challenge_delete_soft(client, db, sample_exercise) -> None:
    payload = challenge_create_dict(str(sample_exercise.id), name_suffix="del")
    c = client.post(BASE, json=payload)
    cid = c.get_json()["message"]
    r = client.delete(f"{BASE}/{cid}")
    assert r.status_code == 200
    g = client.get(f"{BASE}/{cid}")
    assert g.status_code == 404


def test_challenge_progress_get_requires_jwt(client, db) -> None:
    r = client.get(f"{BASE}/progress")
    assert r.status_code == 401


def test_challenge_progress_get_missing_challenge_id(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get(f"{BASE}/progress", headers=headers)
    assert r.status_code == 400


@patch("app.routes.challenges.UserWorkoutService.get_challenge_progress")
def test_challenge_progress_get_success(mock_gp, app, client, db, sample_user) -> None:
    mock_gp.return_value = {"progress": 0.5}
    headers = auth_headers(app, str(sample_user.id))
    cid = str(uuid.uuid4())
    r = client.get(f"{BASE}/progress?challenge_id={cid}", headers=headers)
    assert r.status_code == 200
    assert r.get_json()["message"]["progress"] == 0.5
    mock_gp.assert_called_once()


@patch("app.routes.challenges.UserChallengeService.save_challenge_progress")
def test_challenge_progress_post_save(mock_save, app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    cid = str(uuid.uuid4())
    body = {
        "sequence_day": 1,
        "exercises": [
            {
                "exercise_id": str(uuid.uuid4()),
                "sets_completed": 1,
                "reps_completed": [10],
                "duration_seconds": 60,
                "calories_burned": 5.0,
                "is_completed": True,
            }
        ],
    }
    r = client.post(
        f"{BASE}/progress/batch?challenge_id={cid}",
        headers=headers,
        json=body,
    )
    assert r.status_code == 200
    mock_save.assert_called_once()


def test_challenge_complete_requires_jwt(client, db) -> None:
    r = client.post(f"{BASE}/complete", json={})
    assert r.status_code == 401


@patch("app.routes.challenges.UserChallengeService.save_completed_challenge")
def test_challenge_complete_post_success(mock_save, app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    wid = str(uuid.uuid4())
    ex_id = str(uuid.uuid4())
    r = client.post(
        f"{BASE}/complete",
        headers=headers,
        json={
            "challenge_id": wid,
            "sequence_day": 1,
            "exercises": [
                {
                    "exercise_id": ex_id,
                    "sets_completed": 2,
                    "reps_completed": [8, 8],
                    "duration_seconds": 120,
                    "calories_burned": 20.0,
                    "is_completed": True,
                }
            ],
        },
    )
    assert r.status_code == 200
    mock_save.assert_called_once()


def test_challenge_complete_invalid_body(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post(f"{BASE}/complete", headers=headers, json={"sequence_day": 1})
    assert r.status_code == 400
