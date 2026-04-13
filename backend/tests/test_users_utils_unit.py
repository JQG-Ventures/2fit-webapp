"""Unit tests for ``app.utils.users`` helpers."""

from __future__ import annotations

from types import SimpleNamespace

import pytest
from werkzeug.security import generate_password_hash

from app.utils.users import validate_user_by_credentials

pytestmark = pytest.mark.unit


def test_validate_user_by_credentials_object_with_hash() -> None:
    pw = "secret123"
    user = SimpleNamespace(password_hash=generate_password_hash(pw))
    assert validate_user_by_credentials(user, pw) is True
    assert validate_user_by_credentials(user, "wrong") is False


def test_validate_user_by_credentials_dict_with_hash() -> None:
    pw = "x"
    user = {"password_hash": generate_password_hash(pw)}
    assert validate_user_by_credentials(user, pw) is True


def test_validate_user_by_credentials_rejects_non_string_hash() -> None:
    user = SimpleNamespace(password_hash=12345)
    assert validate_user_by_credentials(user, "any") is False
