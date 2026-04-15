"""Unit tests for ``BaseRepository`` (``db.session`` mocked)."""

from __future__ import annotations

import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from app.repositories.base import BaseRepository

pytestmark = pytest.mark.unit


class _DummyModel:
    def __init__(self, **kwargs: object) -> None:
        for k, v in kwargs.items():
            setattr(self, k, v)


@patch("app.repositories.base.db.session")
def test_get_by_id_returns_none_when_missing(mock_session: MagicMock) -> None:
    mock_session.get.return_value = None
    repo = BaseRepository(_DummyModel)
    assert repo.get_by_id(uuid.uuid4()) is None


@patch("app.repositories.base.db.session")
@patch("app.repositories.base.select")
def test_get_all_uses_scalars(mock_select: MagicMock, mock_session: MagicMock) -> None:
    mock_select.return_value.filter_by.return_value = MagicMock()
    chain = MagicMock()
    chain.all.return_value = []
    mock_session.scalars.return_value = chain
    repo = BaseRepository(_DummyModel)
    assert repo.get_all(is_active=True) == []
    mock_select.return_value.filter_by.assert_called_once_with(is_active=True)


@patch("app.repositories.base.db.session")
def test_create_adds_and_flushes(mock_session: MagicMock) -> None:
    repo = BaseRepository(_DummyModel)
    inst = repo.create(name="x")
    assert inst.name == "x"
    mock_session.add.assert_called_once()
    mock_session.flush.assert_called_once()


@patch("app.repositories.base.db.session")
def test_update_returns_none_when_missing(mock_session: MagicMock) -> None:
    mock_session.get.return_value = None
    repo = BaseRepository(_DummyModel)
    assert repo.update(uuid.uuid4(), name="n") is None


@patch("app.repositories.base.db.session")
def test_update_sets_attributes(mock_session: MagicMock) -> None:
    rid = uuid.uuid4()
    row = SimpleNamespace(name="old", skip=1)
    mock_session.get.return_value = row
    repo = BaseRepository(_DummyModel)
    out = repo.update(rid, name="new", unknown_field=9)
    assert out is row and row.name == "new" and row.skip == 1


@patch("app.repositories.base.db.session")
def test_delete_returns_false_when_missing(mock_session: MagicMock) -> None:
    mock_session.get.return_value = None
    repo = BaseRepository(_DummyModel)
    assert repo.delete(uuid.uuid4()) is False


@patch("app.repositories.base.db.session")
def test_delete_removes_and_returns_true(mock_session: MagicMock) -> None:
    rid = uuid.uuid4()
    row = object()
    mock_session.get.return_value = row
    repo = BaseRepository(_DummyModel)
    assert repo.delete(rid) is True
    mock_session.delete.assert_called_once_with(row)


@patch("app.repositories.base.db.session")
def test_flush_delegates(mock_session: MagicMock) -> None:
    BaseRepository(_DummyModel).flush()
    mock_session.flush.assert_called_once()
