"""Tests for SMS verification endpoints (in-memory ``codes``, no PostgreSQL)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.routes import users as users_module


@pytest.fixture(autouse=True)
def clear_codes() -> None:
    users_module.codes.clear()
    yield
    users_module.codes.clear()


def test_verify_code_requires_fields(client) -> None:
    r = client.post("/api/users/verify-code", json={})
    assert r.status_code == 400


def test_verify_code_invalid(client) -> None:
    users_module.codes["+15551112222"] = "1111"
    r = client.post(
        "/api/users/verify-code",
        json={"number": "+15551112222", "code": "0000"},
    )
    assert r.status_code == 400


def test_verify_code_success(client) -> None:
    users_module.codes["+15551112222"] = "4242"
    r = client.post(
        "/api/users/verify-code",
        json={"number": "+15551112222", "code": "4242"},
    )
    assert r.status_code == 200


@patch("app.routes.users.Client")
def test_send_code_requires_number(mock_twilio, client) -> None:
    r = client.post("/api/users/send-code", json={})
    assert r.status_code == 400
    mock_twilio.assert_not_called()


@patch("app.routes.users.Client")
def test_send_code_twilio_called(mock_client_cls, client) -> None:
    mock_instance = MagicMock()
    mock_client_cls.return_value = mock_instance
    mock_instance.verify.v2.services.return_value.verifications.create.return_value = MagicMock()

    r = client.post("/api/users/send-code", json={"number": "+15559876543"})
    assert r.status_code == 200
    mock_instance.verify.v2.services.assert_called_once()
