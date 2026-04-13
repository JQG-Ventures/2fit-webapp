"""HTTP tests for ``/api/users/*`` (profile, lookup, active plans)."""

from __future__ import annotations

from urllib.parse import quote

import pytest

from tests.db_checks import postgres_reachable
from tests.helpers.jwt_headers import auth_headers

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_profile_get_unauthorized(client, db) -> None:
    r = client.get("/api/users/profile")
    assert r.status_code == 401


def test_profile_get_success(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/users/profile", headers=headers)
    assert r.status_code == 200
    body = r.get_json()
    assert body is not None
    assert body.get("status") == "success"
    msg = body.get("message")
    assert isinstance(msg, dict)
    assert msg.get("email") == sample_user.email


def test_profile_get_not_found(app, client, db) -> None:
    import uuid

    headers = auth_headers(app, str(uuid.uuid4()))
    r = client.get("/api/users/profile", headers=headers)
    assert r.status_code == 404


def test_profile_put_no_valid_fields(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.put("/api/users/profile", headers=headers, json={})
    assert r.status_code == 400
    body = r.get_json()
    assert "No valid fields" in body.get("message", "")


def test_profile_put_updates_name(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.put(
        "/api/users/profile",
        headers=headers,
        json={"name": "UpdatedName"},
    )
    assert r.status_code == 200


def test_by_email_not_found(client, db) -> None:
    r = client.get("/api/users/by-email/nope@example.com")
    assert r.status_code == 404


def test_by_email_found(client, db, sample_user) -> None:
    safe = quote(sample_user.email, safe="")
    r = client.get(f"/api/users/by-email/{safe}")
    assert r.status_code == 200
    body = r.get_json()
    assert body["message"]["email"] == sample_user.email


def test_by_number_not_found(client, db) -> None:
    r = client.get("/api/users/by-number/%2B19990000000")
    assert r.status_code == 404


def test_by_number_found(client, db, sample_user) -> None:
    r = client.get(f"/api/users/by-number/{quote(sample_user.number, safe='')}")
    assert r.status_code == 200


def test_active_plans_unauthorized(client, db) -> None:
    r = client.get("/api/users/active-plans")
    assert r.status_code == 401


def test_active_plans_empty_returns_404(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/users/active-plans", headers=headers)
    assert r.status_code == 404
    body = r.get_json()
    assert "not found" in body.get("message", "").lower()


def test_conversation_get_empty(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/users/conversation", headers=headers)
    assert r.status_code == 200
    body = r.get_json()
    assert body.get("message") == []
