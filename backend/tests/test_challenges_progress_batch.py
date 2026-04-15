"""Tests for GET /api/challenges/challenges/progress/batch (batch challenge progress)."""

from __future__ import annotations

from unittest.mock import patch

from flask.testing import FlaskClient

from tests.helpers.jwt_headers import auth_headers

BATCH_PATH = "/api/challenges/challenges/progress/batch"


def test_batch_requires_jwt(client: FlaskClient) -> None:
    resp = client.get(BATCH_PATH)
    assert resp.status_code == 401


def test_batch_missing_user_id_returns_400(client: FlaskClient, app) -> None:
    headers = auth_headers(app)
    with patch("app.routes.challenges.get_jwt_identity", return_value=None):
        resp = client.get(BATCH_PATH, headers=headers)
    assert resp.status_code == 400
    body = resp.get_json()
    assert body is not None
    assert "Falta user_id" in body.get("message", "")


def test_batch_empty_challenge_ids_returns_empty_list(client: FlaskClient, app) -> None:
    headers = auth_headers(app)
    resp = client.get(BATCH_PATH, headers=headers)
    assert resp.status_code == 200
    body = resp.get_json()
    assert body == {"status": "success", "message": []}


def test_batch_returns_progress_per_id(client: FlaskClient, app) -> None:
    headers = auth_headers(app)
    p1 = {"challenge_id": "a", "progress": 1}
    p2 = {"challenge_id": "b", "progress": 2}
    with patch(
        "app.routes.challenges.UserWorkoutService.get_challenge_progress",
        side_effect=[p1, p2],
    ):
        resp = client.get(
            f"{BATCH_PATH}?challenge_ids=c1&challenge_ids=c2",
            headers=headers,
        )
    assert resp.status_code == 200
    body = resp.get_json()
    assert body == {"status": "success", "message": [p1, p2]}


def test_batch_service_exception_returns_500(client: FlaskClient, app) -> None:
    headers = auth_headers(app)
    with patch(
        "app.routes.challenges.UserWorkoutService.get_challenge_progress",
        side_effect=RuntimeError("db error"),
    ):
        resp = client.get(f"{BATCH_PATH}?challenge_ids=x", headers=headers)
    assert resp.status_code == 500
    body = resp.get_json()
    assert body is not None
    assert body.get("status") == "error"
