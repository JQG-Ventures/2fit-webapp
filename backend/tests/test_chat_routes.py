"""HTTP tests for ``/api/chat`` and ``/api/transcribe``."""

from __future__ import annotations

from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest

from tests.db_checks import postgres_reachable
from tests.helpers.jwt_headers import auth_headers

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_chat_post_requires_jwt(client, db) -> None:
    r = client.post("/api/chat", json={"message": "hi"})
    assert r.status_code == 401


@patch("app.routes.chat.ChatService")
def test_chat_post_success_new_conversation(mock_svc_cls, app, client, db, sample_user) -> None:
    instance = MagicMock()
    instance.handle_message.return_value = ("Assistant reply", True)
    mock_svc_cls.return_value = instance
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/chat", headers=headers, json={"message": "Hello"})
    assert r.status_code == 201
    body = r.get_json()
    assert body["response"] == "Assistant reply"
    assert "initiated" in body["message"].lower()


@patch("app.routes.chat.ChatService")
def test_chat_post_continued_conversation(mock_svc_cls, app, client, db, sample_user) -> None:
    instance = MagicMock()
    instance.handle_message.return_value = ("Next", False)
    mock_svc_cls.return_value = instance
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/chat", headers=headers, json={"message": "More"})
    assert r.status_code == 200


def test_chat_post_missing_json_body(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/chat", headers=headers)
    assert r.status_code == 415


@patch("app.routes.chat.ChatService")
def test_chat_post_service_error_returns_500(mock_svc_cls, app, client, db, sample_user) -> None:
    instance = MagicMock()
    instance.handle_message.side_effect = RuntimeError("openai down")
    mock_svc_cls.return_value = instance
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/chat", headers=headers, json={"message": "x"})
    assert r.status_code == 500


@patch("app.routes.chat.ChatService")
def test_transcribe_post_success(mock_svc_cls, client, db) -> None:
    instance = MagicMock()
    instance.transcribe_audio.return_value = "transcribed text"
    mock_svc_cls.return_value = instance
    data = {"file": (BytesIO(b"fake-audio"), "clip.ogg")}
    r = client.post("/api/transcribe", data=data, content_type="multipart/form-data")
    assert r.status_code == 200
    assert r.get_json()["response"] == "transcribed text"


def test_transcribe_missing_file_returns_500(client, db) -> None:
    r = client.post("/api/transcribe", data={})
    assert r.status_code == 500
