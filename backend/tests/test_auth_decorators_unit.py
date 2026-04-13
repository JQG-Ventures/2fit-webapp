"""Unit tests for ``role_required`` (JWT and repository mocked)."""

from __future__ import annotations

import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from app.auth.decorators import role_required

pytestmark = pytest.mark.unit


def _noop_jwt_required(*_a: object, **_kw: object):
    def _decorator(fn):
        return fn

    return _decorator


@patch("app.auth.decorators.jwt_required", _noop_jwt_required)
@patch("app.auth.decorators.UserRepository")
@patch("app.auth.decorators.get_jwt_identity")
def test_role_required_calls_view_when_role_matches(
    mock_identity: MagicMock, mock_repo_cls: MagicMock
) -> None:
    uid = str(uuid.uuid4())
    mock_identity.return_value = uid
    mock_repo_cls.return_value.get_by_id.return_value = SimpleNamespace(roles=["admin"])

    @role_required(["admin"])
    def view() -> str:
        return "ok"

    assert view() == "ok"


@patch("app.auth.decorators.jwt_required", _noop_jwt_required)
@patch("app.auth.decorators.UserRepository")
@patch("app.auth.decorators.get_jwt_identity")
def test_role_required_404_when_user_missing(
    mock_identity: MagicMock, mock_repo_cls: MagicMock
) -> None:
    mock_identity.return_value = str(uuid.uuid4())
    mock_repo_cls.return_value.get_by_id.return_value = None

    @role_required(["admin"])
    def view() -> str:
        return "ok"

    body, code = view()
    assert code == 404 and "not found" in body["message"].lower()


@patch("app.auth.decorators.jwt_required", _noop_jwt_required)
@patch("app.auth.decorators.UserRepository")
@patch("app.auth.decorators.get_jwt_identity")
def test_role_required_403_when_role_missing(
    mock_identity: MagicMock, mock_repo_cls: MagicMock
) -> None:
    mock_identity.return_value = str(uuid.uuid4())
    mock_repo_cls.return_value.get_by_id.return_value = SimpleNamespace(roles=["user"])

    @role_required(["admin"])
    def view() -> str:
        return "ok"

    body, code = view()
    assert code == 403 and "permissions" in body["message"].lower()


@patch("app.auth.decorators.jwt_required", _noop_jwt_required)
@patch("app.auth.decorators.UserRepository")
@patch("app.auth.decorators.get_jwt_identity")
def test_role_required_401_invalid_identity_type(
    mock_identity: MagicMock, mock_repo_cls: MagicMock
) -> None:
    mock_identity.return_value = 123

    @role_required(["admin"])
    def view() -> str:
        return "ok"

    body, code = view()
    assert code == 401
    mock_repo_cls.return_value.get_by_id.assert_not_called()


@patch("app.auth.decorators.jwt_required", _noop_jwt_required)
@patch("app.auth.decorators.UserRepository")
@patch("app.auth.decorators.get_jwt_identity")
def test_role_required_500_on_repository_error(
    mock_identity: MagicMock, mock_repo_cls: MagicMock
) -> None:
    mock_identity.return_value = str(uuid.uuid4())
    mock_repo_cls.return_value.get_by_id.side_effect = RuntimeError("db")

    @role_required(["admin"])
    def view() -> str:
        return "ok"

    body, code = view()
    assert code == 500 and "db" in body["message"]
