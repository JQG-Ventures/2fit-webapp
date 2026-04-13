"""Unit tests for ``ChatService`` (OpenAI mocked)."""

from __future__ import annotations

import uuid
from unittest.mock import MagicMock, patch

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
