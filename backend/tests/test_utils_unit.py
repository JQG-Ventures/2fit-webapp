"""Unit tests for ``app.utils.utils``."""

from __future__ import annotations

import pytest

from app.utils.utils import (
    build_gpt_generator_request,
    format_json_string,
    parse_answer,
    parse_date,
)

pytestmark = pytest.mark.unit


def test_build_gpt_generator_request_wraps_prompt() -> None:
    req = build_gpt_generator_request("Say hi")
    assert req == [{"role": "user", "content": "Say hi"}]


def test_parse_answer_extracts_json_object() -> None:
    raw = 'Preamble {"items": [1, 2], "ok": true} trailing'
    out = parse_answer(raw)
    assert out == {"items": [1, 2], "ok": True}


def test_parse_answer_returns_none_on_invalid_json() -> None:
    assert parse_answer("no braces here") is None


def test_format_json_string_normalizes_quotes() -> None:
    s = format_json_string("{ key: 1 }")
    assert '"' in s


def test_parse_date_accepts_iso_with_fraction() -> None:
    dt = parse_date("2024-06-01T12:30:45.123456")
    assert dt.year == 2024
    assert dt.month == 6


def test_parse_date_accepts_iso_without_fraction() -> None:
    dt = parse_date("2024-06-01T12:30:45")
    assert dt.day == 1


def test_parse_date_invalid_raises() -> None:
    with pytest.raises(ValueError, match="Invalid date format"):
        parse_date("not-a-date")
