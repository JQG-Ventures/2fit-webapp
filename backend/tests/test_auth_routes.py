"""HTTP tests for ``/api/auth/*`` (PostgreSQL + mocked workout plan generation)."""

from __future__ import annotations

from unittest.mock import patch

import pytest
from werkzeug.security import generate_password_hash

from tests.db_checks import postgres_reachable
from tests.factories import UserFactory
from tests.helpers.jwt_headers import auth_headers
from tests.support.registration_payload import register_payload

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_check_email_requires_email(client, db) -> None:
    r = client.post("/api/auth/check-email", json={})
    assert r.status_code == 400
    body = r.get_json()
    assert body is not None
    assert "Email is required" in body.get("message", "")


def test_check_email_available(client, db) -> None:
    r = client.post("/api/auth/check-email", json={"email": "free@example.com"})
    assert r.status_code == 200
    body = r.get_json()
    assert body is not None
    assert body.get("available") is True


def test_check_email_unavailable(client, db, sample_user) -> None:
    r = client.post("/api/auth/check-email", json={"email": sample_user.email})
    assert r.status_code == 200
    body = r.get_json()
    assert body is not None
    assert body.get("available") is False


def test_check_phone_requires_number(client, db) -> None:
    r = client.post("/api/auth/check-phone", json={})
    assert r.status_code == 400


def test_check_phone_available(client, db) -> None:
    r = client.post("/api/auth/check-phone", json={"number": "+19998887777"})
    assert r.status_code == 200
    body = r.get_json()
    assert body is not None
    assert body.get("available") is True


def test_check_phone_unavailable(client, db, sample_user) -> None:
    r = client.post("/api/auth/check-phone", json={"number": sample_user.number})
    assert r.status_code == 200
    body = r.get_json()
    assert body is not None
    assert body.get("available") is False


def test_register_validation_error(client, db) -> None:
    r = client.post("/api/auth/register", json={"name": "only"})
    assert r.status_code == 400
    body = r.get_json()
    assert body is not None
    assert body.get("status") == "error"


@patch("app.routes.authentication.WorkoutPlanGenerator.generate_workout_plan")
def test_register_success(mock_gen, client, db) -> None:
    payload = register_payload()
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 200, r.get_data(as_text=True)
    body = r.get_json()
    assert body is not None
    assert body.get("status") == "success"
    mock_gen.assert_called_once()


@patch("app.routes.authentication.WorkoutPlanGenerator.generate_workout_plan")
def test_register_duplicate_email(mock_gen, client, db, sample_user) -> None:
    payload = register_payload(email=sample_user.email, number="+18887776655")
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 400
    mock_gen.assert_not_called()


@patch("app.routes.authentication.WorkoutPlanGenerator.generate_workout_plan")
def test_register_duplicate_number(mock_gen, client, db, sample_user) -> None:
    payload = register_payload(email="other@example.com", number=sample_user.number)
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 400
    mock_gen.assert_not_called()


def test_login_missing_credentials(client, db) -> None:
    r = client.post("/api/auth/login", json={"password": "x"})
    assert r.status_code == 400
    body = r.get_json()
    assert body is not None
    assert "Missing credentials" in body.get("message", "")


def test_login_user_not_found(client, db) -> None:
    r = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "secret"},
    )
    assert r.status_code == 404


def test_login_wrong_password(app, client, db) -> None:
    u = UserFactory.create()
    u.password_hash = generate_password_hash("correct")
    db.session.commit()
    email = u.email
    r = client.post("/api/auth/login", json={"email": email, "password": "wrong"})
    assert r.status_code == 401


def test_login_success(app, client, db) -> None:
    u = UserFactory.create()
    u.password_hash = generate_password_hash("correct")
    db.session.commit()
    email = u.email
    r = client.post("/api/auth/login", json={"email": email, "password": "correct"})
    assert r.status_code == 200
    body = r.get_json()
    assert body is not None
    msg = body.get("message")
    assert isinstance(msg, dict)
    assert "access_token" in msg
    assert "refresh_token" in msg
    assert msg.get("user_id")


def test_login_with_phone(app, client, db) -> None:
    u = UserFactory.create()
    u.password_hash = generate_password_hash("secret")
    db.session.commit()
    number = u.number
    r = client.post("/api/auth/login", json={"phone": number, "password": "secret"})
    assert r.status_code == 200


def test_refresh_requires_token(client, db) -> None:
    r = client.post("/api/auth/refresh-token")
    assert r.status_code == 401


def test_refresh_success(app, client, db) -> None:
    u = UserFactory.create()
    u.password_hash = generate_password_hash("pw")
    db.session.commit()
    email = u.email
    login = client.post("/api/auth/login", json={"email": email, "password": "pw"})
    refresh = login.get_json()["message"]["refresh_token"]
    r = client.post(
        "/api/auth/refresh-token",
        headers={"Authorization": f"Bearer {refresh}"},
    )
    assert r.status_code == 200
    body = r.get_json()
    assert body.get("status") == "success"
    assert "access_token" in body["message"]


def test_google_prefill_missing_fields(client, db) -> None:
    r = client.post("/api/auth/google", json={})
    assert r.status_code == 400


def test_google_prefill_new_user(client, db) -> None:
    r = client.post(
        "/api/auth/google",
        json={"email": "newgoogle@example.com", "name": "New User"},
    )
    assert r.status_code == 200
    body = r.get_json()
    assert body.get("status") == "success"
    assert body["message"]["email"] == "newgoogle@example.com"


def test_google_prefill_existing_user_returns_400(client, db, sample_user) -> None:
    r = client.post(
        "/api/auth/google",
        json={"email": sample_user.email, "name": "Taken"},
    )
    assert r.status_code == 400


@patch("app.routes.authentication.UserRepository")
def test_check_email_repository_error_returns_500(mock_cls, client, db) -> None:
    mock_cls.return_value.get_by_email.side_effect = OSError("db")
    r = client.post("/api/auth/check-email", json={"email": "err@example.com"})
    assert r.status_code == 500


@patch("app.routes.authentication.UserRepository")
def test_check_phone_repository_error_returns_500(mock_cls, client, db) -> None:
    mock_cls.return_value.get_by_number.side_effect = OSError("db")
    r = client.post("/api/auth/check-phone", json={"number": "+15550001111"})
    assert r.status_code == 500


@patch("app.routes.authentication.UserRepository")
def test_login_unexpected_error_returns_500(mock_cls, client, db) -> None:
    mock_cls.return_value.get_by_email.side_effect = RuntimeError("db")
    r = client.post("/api/auth/login", json={"email": "a@b.com", "password": "x"})
    assert r.status_code == 500


@patch("app.routes.authentication.id_token.verify_oauth2_token")
def test_google_login_missing_token_returns_400(mock_verify, client, db) -> None:
    r = client.post("/api/auth/google-login", json={})
    assert r.status_code == 400
    mock_verify.assert_not_called()


@patch("app.routes.authentication.id_token.verify_oauth2_token")
def test_google_login_invalid_token_returns_400(mock_verify, client, db) -> None:
    mock_verify.side_effect = ValueError("bad token")
    r = client.post("/api/auth/google-login", json={"id_token": "x"})
    assert r.status_code == 400


@patch("app.routes.authentication.id_token.verify_oauth2_token")
def test_google_login_no_email_in_token(mock_verify, client, db) -> None:
    mock_verify.return_value = {}
    r = client.post("/api/auth/google-login", json={"id_token": "x"})
    assert r.status_code == 400


@patch("app.routes.authentication.id_token.verify_oauth2_token")
def test_google_login_user_not_found(mock_verify, client, db) -> None:
    mock_verify.return_value = {"email": "missing@example.com"}
    r = client.post("/api/auth/google-login", json={"id_token": "x"})
    assert r.status_code == 404


@patch("app.routes.authentication.id_token.verify_oauth2_token")
def test_google_login_wrong_auth_provider(mock_verify, client, db, sample_user) -> None:
    mock_verify.return_value = {"email": sample_user.email}
    r = client.post("/api/auth/google-login", json={"id_token": "x"})
    assert r.status_code == 401


@patch("app.routes.authentication.id_token.verify_oauth2_token")
def test_google_login_success(mock_verify, app, client, db) -> None:
    UserFactory.create(email="googleok@example.com", auth_provider="google", password_hash="")
    db.session.commit()
    mock_verify.return_value = {"email": "googleok@example.com"}
    r = client.post("/api/auth/google-login", json={"id_token": "fake"})
    assert r.status_code == 200
    assert "access_token" in r.get_json()["message"]


@patch("app.routes.authentication.WorkoutPlanGenerator.generate_workout_plan")
def test_register_internal_error_returns_500(mock_gen, client, db) -> None:
    mock_gen.side_effect = RuntimeError("plan fail")
    payload = register_payload()
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 500


def test_notifications_player_id_success(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post(
        "/api/auth/notifications/player-id",
        headers=headers,
        json={"player_id": "onesignal-abc", "platform": "ios"},
    )
    assert r.status_code == 200


def test_notifications_player_id_validation_error(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/auth/notifications/player-id", headers=headers, json={})
    assert r.status_code == 400


@patch("app.routes.authentication.get_jwt_identity", return_value="not-a-uuid")
def test_notifications_player_id_invalid_identity(_mock_jwt, app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post(
        "/api/auth/notifications/player-id",
        headers=headers,
        json={"player_id": "p1"},
    )
    assert r.status_code == 401
