"""Tests for ``ChallengeRepository``."""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.repositories.challenge_repository import ChallengeRepository
from tests.db_checks import postgres_reachable
from tests.factories import ChallengeFactory, ExerciseFactory

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_get_active_filters_inactive(db) -> None:
    ChallengeFactory.create(name="Active Ch", is_active=True)
    ChallengeFactory.create(name="Inactive Ch", is_active=False)
    repo = ChallengeRepository()
    active = repo.get_active()
    names = {c.name for c in active}
    assert "Active Ch" in names
    assert "Inactive Ch" not in names


def test_get_with_schedule_loads_days(db, challenge_with_one_exercise) -> None:
    repo = ChallengeRepository()
    ch = challenge_with_one_exercise.challenge
    loaded = repo.get_with_schedule(ch.id)
    assert loaded is not None
    assert loaded.name == ch.name
    assert len(loaded.challenge_days) >= 1
    assert len(loaded.challenge_days[0].exercises) >= 1


def test_create_full_challenge_persists_schedule(db) -> None:
    ex = ExerciseFactory.create()
    repo = ChallengeRepository()
    ch = repo.create_full_challenge(
        {
            "name": "Repo Full",
            "description": "",
            "plan_type": "challenge",
            "duration_days": 14,
            "price": 0.0,
            "image_url": "",
            "video_url": "",
            "intensity": True,
            "equipment": [],
            "category": ["strength"],
            "level": "intermediate",
            "is_active": True,
        },
        [
            {
                "sequence_day": 1,
                "name": "D1",
                "is_rest": False,
                "exercises": [
                    {
                        "exercise_id": str(ex.id),
                        "sets": 2,
                        "reps": 8,
                        "rest_seconds": 45,
                    }
                ],
            }
        ],
    )
    db.session.commit()
    loaded = repo.get_with_schedule(ch.id)
    assert loaded is not None
    assert loaded.name == "Repo Full"
    assert loaded.challenge_days[0].exercises[0].exercise_id == ex.id


def test_soft_delete(db) -> None:
    c = ChallengeFactory.create()
    cid = c.id
    repo = ChallengeRepository()
    assert repo.soft_delete(cid) is True
    db.session.commit()
    assert repo.get_by_id(cid) is not None
    assert repo.get_by_id(cid).is_active is False


def test_replace_schedule(db, create_challenge_with_one_exercise) -> None:
    ex2 = ExerciseFactory.create(name="Replacement Ex")
    ch_id = create_challenge_with_one_exercise.challenge.id
    repo = ChallengeRepository()
    repo.replace_schedule(
        ch_id,
        [
            {
                "sequence_day": 1,
                "name": "New Day 1",
                "is_rest": False,
                "exercises": [
                    {
                        "exercise_id": str(ex2.id),
                        "sets": 2,
                        "reps": 12,
                        "rest_seconds": 30,
                    }
                ],
            }
        ],
    )
    db.session.commit()
    loaded = repo.get_with_schedule(ch_id)
    assert loaded is not None
    assert loaded.challenge_days[0].name == "New Day 1"
    assert loaded.challenge_days[0].exercises[0].exercise_id == ex2.id


@pytest.fixture
def challenge_with_one_exercise(db):
    from tests.support.builders import create_challenge_with_one_exercise as build

    challenge, _day, _exercise, _cde = build()
    db.session.commit()
    return SimpleNamespace(challenge=challenge)
