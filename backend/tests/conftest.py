"""Shared pytest fixtures for Flask app and JWT-authenticated requests."""

from __future__ import annotations

import os

# Must run before any import that loads ``app`` (including via ``tests.factories``).
# Models use PostgreSQL-only types (ARRAY, UUID); integration tests use TEST_DATABASE_URL.
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql://postgres:postgres@127.0.0.1:5432/twofit_test",
)

from types import SimpleNamespace

import pytest
from flask import Flask
from flask.testing import FlaskClient

from tests.factories import ExerciseFactory, UserFactory, WorkoutPlanFactory
from tests.helpers.jwt_headers import auth_headers as auth_headers_helper
from tests.support.builders import (
    create_plan_with_one_exercise,
    create_user_saved_plan_and_active,
)

_tables_created = False


@pytest.fixture(scope="session")
def app() -> Flask:
    from app import create_app

    application = create_app()
    application.config["TESTING"] = True
    return application


@pytest.fixture()
def client(app: Flask) -> FlaskClient:
    return app.test_client()


@pytest.fixture()
def db(app: Flask):
    """PostgreSQL session: create schema once, truncate after each test that uses this fixture."""
    global _tables_created
    from app.extensions import db as _db
    from tests.db_utils import truncate_all_tables

    with app.app_context():
        if not _tables_created:
            _db.create_all()
            _tables_created = True
        yield _db
        truncate_all_tables()


def auth_headers(app: Flask, user_id: str | None = None) -> dict[str, str]:
    """Return Authorization header with a valid access token for ``user_id``."""
    return auth_headers_helper(app, user_id)


# --- Integration fixtures (require ``db`` / PostgreSQL) ---------------------------


@pytest.fixture
def sample_user(db):
    user = UserFactory.create()
    db.session.commit()
    return user


@pytest.fixture
def sample_exercise(db):
    exercise = ExerciseFactory.create()
    db.session.commit()
    return exercise


@pytest.fixture
def sample_workout_plan(db):
    plan = WorkoutPlanFactory.create()
    db.session.commit()
    return plan


@pytest.fixture
def plan_with_one_exercise(db):
    plan, day, exercise, wde = create_plan_with_one_exercise()
    db.session.commit()
    return SimpleNamespace(plan=plan, day=day, exercise=exercise, wde=wde)


@pytest.fixture
def user_saved_plan_and_active(db):
    user, plan, saved, active_plan = create_user_saved_plan_and_active()
    db.session.commit()
    return SimpleNamespace(user=user, plan=plan, saved=saved, active_plan=active_plan)
