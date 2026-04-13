"""Tests for ``UserRepository`` (PostgreSQL)."""

from __future__ import annotations

import uuid
from datetime import date

import pytest
from sqlalchemy import select
from werkzeug.security import generate_password_hash

from app.models.user import User, UserAutomationData, UserPreference, UserSettings
from app.repositories.user_repository import UserRepository
from tests.db_checks import postgres_reachable

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_get_by_email_found(app, db, sample_user) -> None:
    with app.app_context():
        repo = UserRepository()
        found = repo.get_by_email(sample_user.email)
        assert found is not None
        assert found.id == sample_user.id


def test_get_by_email_not_found(app, db) -> None:
    with app.app_context():
        repo = UserRepository()
        assert repo.get_by_email("nonexistent@example.com") is None


def test_get_by_number_found(app, db, sample_user) -> None:
    with app.app_context():
        repo = UserRepository()
        found = repo.get_by_number(sample_user.number)
        assert found is not None
        assert found.id == sample_user.id


def test_get_by_number_not_found(app, db) -> None:
    with app.app_context():
        repo = UserRepository()
        assert repo.get_by_number("+19999999999") is None


def test_get_by_id_found(app, db, sample_user) -> None:
    with app.app_context():
        repo = UserRepository()
        found = repo.get_by_id(sample_user.id)
        assert found is not None
        assert found.email == sample_user.email


def test_get_by_id_not_found(app, db) -> None:
    with app.app_context():
        repo = UserRepository()
        assert repo.get_by_id(uuid.uuid4()) is None


def test_update_profile_updates_fields(app, db, sample_user) -> None:
    with app.app_context():
        repo = UserRepository()
        updated = repo.update_profile(sample_user.id, {"name": "Updated", "weight": 80})
        assert updated is not None
        assert updated.name == "Updated"
        assert updated.weight == 80


def test_update_profile_not_found(app, db) -> None:
    with app.app_context():
        repo = UserRepository()
        assert repo.update_profile(uuid.uuid4(), {"name": "X"}) is None


def test_create_with_related_creates_preference_settings_automation(app, db) -> None:
    with app.app_context():
        repo = UserRepository()
        suffix = uuid.uuid4().hex[:8]
        user_data = {
            "name": "Repo",
            "last": "Test",
            "age": 28,
            "birthdate": date(1996, 3, 10),
            "code_number": f"{int(suffix, 16) % 10_000_000_000:010d}"[:10],
            "country": "CR",
            "number": f"+50688{suffix[:6]}",
            "gender": "m",
            "email": f"repo_{suffix}@test.example.com",
            "password_hash": generate_password_hash("pw"),
            "roles": ["user"],
            "height": 175,
            "weight": 75,
            "target_weight": 72,
            "profile_image": "",
            "auth_provider": "default",
            "fitness_goal": "strength",
            "fitness_level": "intermediate",
            "preferred_muscle_groups": ["chest"],
            "equipment": ["barbell"],
            "available_days": ["monday"],
            "workout_types": ["strength"],
        }
        preference_data = {
            "water_consumption": 2.0,
            "dietary_restrictions": [],
            "dietary_goals": None,
            "preferences": [],
        }
        settings_data = {
            "notification_general": True,
            "notification_updates": True,
            "notification_services": True,
            "notification_tips": True,
            "notification_bot": True,
            "notification_reminders": True,
            "nutrition_enabled": False,
            "language_preference": "es",
            "security_face_id": True,
            "security_remember_me": True,
            "security_touch_id": True,
        }
        automation_data = {
            "profile_complete": False,
            "message_sent": False,
            "greetings_sent": False,
            "created_by_bot": False,
            "last_motivational_message": None,
        }
        user = repo.create_with_related(user_data, preference_data, settings_data, automation_data)
        db.session.commit()

        assert db.session.get(User, user.id) is not None
        assert (
            db.session.scalar(select(UserPreference).where(UserPreference.user_id == user.id))
            is not None
        )
        assert (
            db.session.scalar(select(UserSettings).where(UserSettings.user_id == user.id))
            is not None
        )
        assert (
            db.session.scalar(
                select(UserAutomationData).where(UserAutomationData.user_id == user.id)
            )
            is not None
        )


def test_get_all_empty_filter(app, db) -> None:
    with app.app_context():
        repo = UserRepository()
        assert isinstance(repo.get_all(), list)
