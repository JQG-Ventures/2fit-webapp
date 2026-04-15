"""Unit tests for ``ChatService`` (OpenAI mocked)."""

from __future__ import annotations

import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock, mock_open, patch

import pytest

from app.services.chat_service import ChatService

pytestmark = pytest.mark.unit


def test_generate_bot_response_prefers_quoted_bot_prefix() -> None:
    client = MagicMock()
    raw = MagicMock()
    raw.choices = [MagicMock(message=MagicMock(content='Some text Bot: "Hello from bot" tail'))]
    client.chat.completions.create.return_value = raw
    out = ChatService.generate_bot_response(
        [{"role": "user", "content": "hi"}], client, "gpt-4o-mini"
    )
    assert out == "Hello from bot"


def test_generate_bot_response_falls_back_to_full_content() -> None:
    client = MagicMock()
    raw = MagicMock()
    raw.choices = [MagicMock(message=MagicMock(content="No quote pattern here"))]
    client.chat.completions.create.return_value = raw
    out = ChatService.generate_bot_response(
        [{"role": "user", "content": "hi"}], client, "gpt-4o-mini"
    )
    assert out == "No quote pattern here"


@patch("app.services.chat_service.parse_answer")
@patch.object(ChatService, "generate_bot_response", return_value='{"ok": true}')
def test_generate_motivational_phrases_returns_parsed(
    _mock_gen: MagicMock, mock_parse: MagicMock
) -> None:
    mock_parse.return_value = {"phrases": ["Go!"]}
    client = MagicMock()
    svc = ChatService(client)
    result = svc.generate_motivational_phrases()
    assert result == {"phrases": ["Go!"]}


def test_handle_message_empty_string_returns_without_openai() -> None:
    client = MagicMock()
    svc = ChatService(client)
    msg, is_new = svc.handle_message("", uuid.uuid4())
    assert msg == "No message received"
    assert is_new is False
    client.chat.completions.create.assert_not_called()


@patch("app.services.chat_service.db.session.flush")
@patch.object(ChatService, "generate_bot_response", return_value="bot-says-hi")
@patch("app.services.chat_service.ConversationRepository")
def test_handle_message_new_conversation(
    mock_cr_cls: MagicMock, _mock_gen: MagicMock, _flush: MagicMock
) -> None:
    uid = uuid.uuid4()
    cid = uuid.uuid4()
    conv = SimpleNamespace(id=cid, messages=[])
    after = SimpleNamespace(
        id=cid,
        messages=[
            SimpleNamespace(role="system", content="s"),
            SimpleNamespace(role="user", content="hello"),
        ],
    )
    mock_repo = MagicMock()
    mock_cr_cls.return_value = mock_repo
    mock_repo.get_by_user.side_effect = [None, after]
    mock_repo.get_or_create.return_value = conv

    client = MagicMock()
    svc = ChatService(client)
    reply, is_new = svc.handle_message("hello", uid)
    assert reply == "bot-says-hi" and is_new is True
    mock_repo.add_message.assert_called()


@patch("app.services.chat_service.db.session.flush")
@patch.object(ChatService, "generate_bot_response", return_value="next")
@patch("app.services.chat_service.ConversationRepository")
def test_handle_message_existing_conversation(
    mock_cr_cls: MagicMock, _mock_gen: MagicMock, _flush: MagicMock
) -> None:
    uid = uuid.uuid4()
    cid = uuid.uuid4()
    existing = SimpleNamespace(
        id=cid,
        messages=[SimpleNamespace(role="system", content="s")],
    )
    after = SimpleNamespace(
        id=cid,
        messages=[
            SimpleNamespace(role="system", content="s"),
            SimpleNamespace(role="user", content="x"),
        ],
    )
    mock_repo = MagicMock()
    mock_cr_cls.return_value = mock_repo
    mock_repo.get_by_user.side_effect = [existing, after]

    svc = ChatService(MagicMock())
    reply, is_new = svc.handle_message("x", uid)
    assert reply == "next" and is_new is False


@patch("app.services.chat_service.db.session.flush")
@patch("app.services.chat_service.ConversationRepository")
def test_handle_message_raises_when_get_or_create_returns_none(
    mock_cr_cls: MagicMock, _flush: MagicMock
) -> None:
    mock_repo = MagicMock()
    mock_cr_cls.return_value = mock_repo
    mock_repo.get_by_user.return_value = None
    mock_repo.get_or_create.return_value = None
    with pytest.raises(RuntimeError, match="Failed to create conversation"):
        ChatService(MagicMock()).handle_message("hi", uuid.uuid4())


@patch("app.services.chat_service.db.session.flush")
@patch("app.services.chat_service.ConversationRepository")
def test_handle_message_raises_when_reload_returns_none(
    mock_cr_cls: MagicMock, _flush: MagicMock
) -> None:
    cid = uuid.uuid4()
    conv = SimpleNamespace(id=cid, messages=[])
    mock_repo = MagicMock()
    mock_cr_cls.return_value = mock_repo
    mock_repo.get_by_user.side_effect = [None, None]
    mock_repo.get_or_create.return_value = conv
    with pytest.raises(RuntimeError, match="Failed to load conversation"):
        ChatService(MagicMock()).handle_message("hi", uuid.uuid4())


@patch("builtins.open", mock_open(read_data=b"fake-bytes"))
def test_transcribe_audio_returns_api_text() -> None:
    client = MagicMock()
    client.audio.transcriptions.create.return_value = MagicMock(text="transcribed line")
    audio = MagicMock()
    svc = ChatService(client)
    out = svc.transcribe_audio(audio)
    assert out == "transcribed line"
    audio.save.assert_called_once_with("audio.ogg")
