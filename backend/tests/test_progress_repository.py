"""Tests for progress-related repositories."""

from __future__ import annotations

from datetime import UTC, datetime

import pytest

from app.repositories.progress_repository import (
    DayProgressRepository,
    SavedWorkoutRepository,
)
from tests.db_checks import postgres_reachable
from tests.factories import ActivePlanFactory, UserFactory, WorkoutPlanFactory
from tests.factories.progress import SavedWorkoutFactory

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_saved_add_get_remove(app, db) -> None:
    user = UserFactory.create()
    plan = WorkoutPlanFactory.create()
    db.session.commit()
    uid, pid = user.id, plan.id
    with app.app_context():
        repo = SavedWorkoutRepository()
        sw = repo.add(uid, pid)
        assert sw.user_id == uid
        rows = repo.get_by_user(uid)
        assert len(rows) == 1
        assert repo.remove(uid, pid) is True
        assert repo.get_by_user(uid) == []


def test_saved_add_idempotent(app, db) -> None:
    user = UserFactory.create()
    plan = WorkoutPlanFactory.create()
    db.session.commit()
    with app.app_context():
        repo = SavedWorkoutRepository()
        a = repo.add(user.id, plan.id)
        b = repo.add(user.id, plan.id)
        assert a.id == b.id


def test_saved_remove_missing_returns_false(app, db, sample_user) -> None:
    plan = WorkoutPlanFactory.create()
    db.session.commit()
    with app.app_context():
        repo = SavedWorkoutRepository()
        assert repo.remove(sample_user.id, plan.id) is False


def test_day_progress_find_or_create(app, db) -> None:
    user = UserFactory.create()
    plan = WorkoutPlanFactory.create()
    ap = ActivePlanFactory.create(
        user=user,
        workout_plan=plan,
        workout_name=plan.name,
        plan_type=plan.plan_type,
        start_date=datetime(2024, 1, 1, tzinfo=UTC),
    )
    db.session.commit()
    with app.app_context():
        repo = DayProgressRepository()
        d1 = repo.find_or_create(ap.id, week_number=1, day_of_week="monday")
        d2 = repo.find_or_create(ap.id, week_number=1, day_of_week="monday")
        assert d1.id == d2.id


def test_saved_workout_factory_links(app, db) -> None:
    sw = SavedWorkoutFactory.create()
    db.session.commit()
    with app.app_context():
        repo = SavedWorkoutRepository()
        rows = repo.get_by_user(sw.user_id)
        assert len(rows) == 1
