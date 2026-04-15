"""Integration tests for ``UserChallengeService`` (PostgreSQL)."""

from __future__ import annotations

from datetime import UTC, datetime

import pytest

from app.services.user_challenge_service import UserChallengeService
from tests.db_checks import postgres_reachable
from tests.factories import ChallengeFactory, ExerciseFactory, UserFactory

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_save_challenge_progress_creates_active_challenge(db) -> None:
    user = UserFactory.create()
    challenge = ChallengeFactory.create()
    ex = ExerciseFactory.create()
    db.session.commit()
    uid, cid = str(user.id), str(challenge.id)
    payload = {
        "date": datetime.now(UTC).isoformat(),
        "sequence_day": 1,
        "exercises": [
            {
                "exercise_id": str(ex.id),
                "sets_completed": 2,
                "reps_completed": [10, 10],
                "duration_seconds": 120,
                "calories_burned": 15.0,
                "is_completed": True,
            }
        ],
    }
    UserChallengeService.save_challenge_progress(uid, cid, payload)
    db.session.commit()


def test_save_completed_challenge_persists(db) -> None:
    user = UserFactory.create()
    challenge = ChallengeFactory.create()
    ex = ExerciseFactory.create()
    db.session.commit()
    data = {
        "challenge_id": str(challenge.id),
        "sequence_day": 1,
        "date": datetime.now(UTC).isoformat(),
        "exercises": [
            {
                "exercise_id": str(ex.id),
                "sets_completed": 1,
                "reps_completed": [12],
                "duration_seconds": 90,
                "calories_burned": 10.0,
                "is_completed": True,
            }
        ],
    }
    UserChallengeService.save_completed_challenge(str(user.id), data)
    db.session.commit()
