"""HTTP tests for ``/api/exercises/*``."""

from __future__ import annotations

import uuid

import pytest

from tests.db_checks import postgres_reachable
from tests.factories import ExerciseFactory
from tests.helpers.jwt_headers import auth_headers
from tests.support.workout_payload import exercise_create_dict

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_exercises_list_unauthorized(client, db) -> None:
    r = client.get("/api/exercises/exercises")
    assert r.status_code == 401


def test_exercises_list_success(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/exercises/exercises", headers=headers)
    assert r.status_code == 200


def test_exercises_post_missing_body(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/exercises/exercises", headers=headers)
    assert r.status_code == 400


def test_exercises_post_success(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    payload = exercise_create_dict(name_suffix="route")
    r = client.post("/api/exercises/exercises", headers=headers, json=payload)
    assert r.status_code == 200
    assert r.get_json()["status"] == "success"


def test_exercise_get_not_found(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get(f"/api/exercises/exercises/{uuid.uuid4()}", headers=headers)
    assert r.status_code == 404


def test_exercise_get_by_id(app, client, db, sample_user, sample_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get(f"/api/exercises/exercises/{sample_exercise.id}", headers=headers)
    assert r.status_code == 200
    assert r.get_json()["data"]["name"] == sample_exercise.name


def test_exercise_put_updates(app, client, db, sample_user, sample_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    payload = exercise_create_dict(name_suffix="updated")
    payload["name"] = "Updated name"
    r = client.put(
        f"/api/exercises/exercises/{sample_exercise.id}",
        headers=headers,
        json=payload,
    )
    assert r.status_code == 200


def test_exercise_delete_soft(app, client, db, sample_user, sample_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.delete(f"/api/exercises/exercises/{sample_exercise.id}", headers=headers)
    assert r.status_code == 200


def test_exercises_bulk(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post(
        "/api/exercises/exercises/bulk",
        headers=headers,
        json=[exercise_create_dict(name_suffix="b1"), exercise_create_dict(name_suffix="b2")],
    )
    assert r.status_code == 201


def test_similar_not_found(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get(f"/api/exercises/similar-exercises/{uuid.uuid4()}", headers=headers)
    assert r.status_code == 404


def test_similar_found(app, client, db, sample_user) -> None:
    with app.app_context():
        ex1 = ExerciseFactory.create(muscle_group=["chest", "biceps"])
        ExerciseFactory.create(muscle_group=["chest", "triceps"])
        db.session.commit()
        eid = ex1.id
    headers = auth_headers(app, str(sample_user.id))
    r = client.get(f"/api/exercises/similar-exercises/{eid}", headers=headers)
    assert r.status_code == 200


def test_muscle_taxonomy_returns_list(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/exercises/exercises/muscles/taxonomy", headers=headers)
    assert r.status_code == 200
    msg = r.get_json().get("message")
    assert isinstance(msg, list)
