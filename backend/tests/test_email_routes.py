"""HTTP tests for ``/api/mail/save``."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from tests.db_checks import postgres_reachable

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_save_email_missing_fields_returns_400(client, db) -> None:
    r = client.post("/api/mail/save", json={"to": "a@b.com"})
    assert r.status_code == 400


@patch("app.routes.email.SendGridAPIClient")
def test_save_email_success_stores_and_sends(mock_sg_cls, client, db) -> None:
    send_instance = MagicMock()
    mock_sg_cls.return_value = send_instance
    r = client.post(
        "/api/mail/save",
        json={
            "to": "newuser@example.com",
            "html": "<p>Hi</p>",
            "subject": "Hello",
        },
    )
    assert r.status_code == 200
    assert r.get_json()["status"] == "success"
    send_instance.send.assert_called_once()


@patch("app.routes.email.SendGridAPIClient")
def test_save_email_duplicate_returns_409(mock_sg_cls, client, db) -> None:
    mock_sg_cls.return_value = MagicMock()
    addr = "existing@example.com"
    client.post(
        "/api/mail/save",
        json={"to": addr, "html": "<p>x</p>", "subject": "s"},
    )
    r2 = client.post(
        "/api/mail/save",
        json={"to": addr, "html": "<p>y</p>", "subject": "s2"},
    )
    assert r2.status_code == 409
