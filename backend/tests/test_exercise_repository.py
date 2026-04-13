"""Tests for ``ExerciseRepository``."""

from __future__ import annotations

import uuid

import pytest

from app.repositories.exercise_repository import ExerciseRepository
from tests.db_checks import postgres_reachable
from tests.factories import ExerciseFactory

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_get_active_filters_inactive(db) -> None:
    ExerciseFactory.create(is_active=True, name="Active Ex")
    ExerciseFactory.create(is_active=False, name="Inactive Ex")
    repo = ExerciseRepository()
    active = repo.get_active()
    names = {e.name for e in active}
    assert "Active Ex" in names
    assert "Inactive Ex" not in names


def test_get_by_ids_order(db, sample_exercise) -> None:
    repo = ExerciseRepository()
    rows = repo.get_by_ids([sample_exercise.id])
    assert len(rows) == 1


def test_get_similar_overlapping_muscle(db) -> None:
    a = ExerciseFactory.create(
        name="A",
        muscle_group=["chest", "triceps"],
        is_active=True,
    )
    b = ExerciseFactory.create(
        name="B",
        muscle_group=["chest", "shoulders"],
        is_active=True,
    )
    db.session.commit()
    repo = ExerciseRepository()
    sim = repo.get_similar(a.id)
    ids = {ex.id for ex in sim}
    assert b.id in ids


def test_get_similar_unknown_returns_empty(db) -> None:
    repo = ExerciseRepository()
    assert repo.get_similar(uuid.uuid4()) == []


def test_soft_delete(db, sample_exercise) -> None:
    eid = sample_exercise.id
    repo = ExerciseRepository()
    assert repo.soft_delete(eid) is True
    db.session.commit()
    ex = repo.get_by_id(eid)
    assert ex is not None
    assert ex.is_active is False


def test_bulk_create(db) -> None:
    data = [
        {
            "name": "Bulk 1",
            "description": "",
            "category": "cardio",
            "muscle_group": ["legs"],
            "difficulty": "beginner",
            "equipment": [],
            "instructions": [],
            "contradictions": [],
            "is_active": True,
            "image_url": "",
            "video_url": "",
        }
    ]
    repo = ExerciseRepository()
    rows = repo.bulk_create(data)
    assert len(rows) == 1
    db.session.commit()
