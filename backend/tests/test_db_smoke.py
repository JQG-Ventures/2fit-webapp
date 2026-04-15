"""PostgreSQL integration smoke: factories + schema (requires TEST_DATABASE_URL / Docker postgres)."""

from __future__ import annotations

import pytest

from app.models.user import User
from tests.db_checks import postgres_reachable
from tests.factories import UserFactory


@pytest.mark.skipif(
    not postgres_reachable(),
    reason="PostgreSQL not reachable (Docker: compose up postgres; create DB twofit_test)",
)
def test_user_factory_persists(db) -> None:
    user = UserFactory.create()
    db.session.commit()
    loaded = db.session.get(User, user.id)
    assert loaded is not None
    assert loaded.email == user.email
