"""Unit tests for ``app.utils.users`` helpers."""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from werkzeug.exceptions import Forbidden
from werkzeug.security import generate_password_hash

from app.utils.users import roles_required, validate_user_by_credentials

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


@patch("app.utils.users.check_password_hash", side_effect=ValueError("bad hash"))
def test_validate_user_by_credentials_exception_returns_false(_mock_check: MagicMock) -> None:
    user = SimpleNamespace(password_hash="x")
    assert validate_user_by_credentials(user, "pw") is False


def test_roles_required_allows_matching_role() -> None:
    from flask import Flask

    app = Flask(__name__)
    with app.test_request_context():
        with (
            patch("app.utils.users.verify_jwt_in_request"),
            patch("app.utils.users.get_jwt", return_value={"roles": ["admin"]}),
        ):

            @roles_required(["admin"])
            def protected() -> str:
                return "ok"

            assert protected() == "ok"


def test_roles_required_abort_when_role_missing() -> None:
    from flask import Flask

    app = Flask(__name__)
    with app.test_request_context():
        with (
            patch("app.utils.users.verify_jwt_in_request"),
            patch("app.utils.users.get_jwt", return_value={"roles": ["user"]}),
        ):

            @roles_required(["admin"])
            def protected() -> str:
                return "ok"

            with pytest.raises(Forbidden):
                protected()
