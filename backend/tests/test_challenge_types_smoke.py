"""Runtime shape checks for ``app.types.challenge_types`` TypedDicts."""

from __future__ import annotations

import pytest

from app.types.challenge_types import ChallengeDay, ChallengeProgress

pytestmark = pytest.mark.unit


def test_challenge_progress_dict_matches_typed_dict() -> None:
    day: ChallengeDay = {
        "sequence_day": 1,
        "date": "2024-01-01",
        "is_completed": True,
        "status": "completed",
        "exercises": [{"exercise_id": "e1"}],
    }
    prog: ChallengeProgress = {
        "challenge_id": "c1",
        "name": "Test",
        "total_days": 7,
        "progress": 0.5,
        "days": [day],
    }
    assert prog["total_days"] == 7
    assert len(prog["days"]) == 1
