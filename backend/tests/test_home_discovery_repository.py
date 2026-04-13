"""Tests for ``home_discovery_repository`` card helpers."""

from __future__ import annotations

import pytest

from app.repositories.home_discovery_repository import get_by_level_cards, get_explore_cards
from tests.db_checks import postgres_reachable

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_get_explore_cards_empty_when_no_content(app, db) -> None:
    with app.app_context():
        cards = get_explore_cards(6)
        assert isinstance(cards, list)


def test_get_by_level_all(app, db) -> None:
    with app.app_context():
        cards = get_by_level_cards("all", 3)
        assert isinstance(cards, list)
