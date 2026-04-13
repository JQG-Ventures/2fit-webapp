"""Unit tests for ``UserChallengeService`` (repos and ``db`` mocked)."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from app.services.user_challenge_service import UserChallengeService

pytestmark = pytest.mark.unit

UID = str(uuid.uuid4())
CID = str(uuid.uuid4())


@patch("app.services.user_challenge_service.db.session.flush")
@patch("app.services.user_challenge_service.ActiveChallengeRepository")
def test_save_challenge_progress_creates_when_no_active(
    mock_repo_cls: MagicMock, _flush: MagicMock
) -> None:
    mock_repo = MagicMock()
    mock_repo.get_for_user.return_value = None
    created = SimpleNamespace(id=uuid.uuid4())
    mock_repo.create.return_value = created
    mock_repo_cls.return_value = mock_repo

    UserChallengeService.save_challenge_progress(
        UID,
        CID,
        {"sequence_day": 1, "exercises": [{"exercise_id": str(uuid.uuid4())}]},
    )
    mock_repo.create.assert_called_once()


@patch("app.services.user_challenge_service.db.session.flush")
@patch("app.services.user_challenge_service.ActiveChallengeRepository")
def test_save_challenge_progress_adds_new_exercise_same_session(
    mock_repo_cls: MagicMock, _flush: MagicMock
) -> None:
    ex_id = str(uuid.uuid4())
    other_id = str(uuid.uuid4())
    ex_row = SimpleNamespace(
        exercise_id=uuid.UUID(ex_id),
        sets_completed=1,
        reps_completed=[],
        duration_seconds=0,
        calories_burned=0.0,
        is_completed=False,
    )
    active = SimpleNamespace(
        id=uuid.uuid4(),
        sequence_day=1,
        date=datetime(2024, 1, 5, 12, 0, 0, tzinfo=UTC),
        exercises=[ex_row],
    )
    mock_repo = MagicMock()
    mock_repo.get_for_user.return_value = active
    mock_repo_cls.return_value = mock_repo

    UserChallengeService.save_challenge_progress(
        UID,
        CID,
        {
            "sequence_day": 1,
            "date": "2024-01-05T12:00:00+00:00",
            "exercises": [{"exercise_id": other_id, "sets_completed": 1}],
        },
    )
    mock_repo.add_exercise.assert_called()


@patch("app.services.user_challenge_service.db.session.flush")
@patch("app.services.user_challenge_service.ActiveChallengeRepository")
def test_save_challenge_progress_updates_same_day(
    mock_repo_cls: MagicMock, _flush: MagicMock
) -> None:
    ex_id = str(uuid.uuid4())
    ex_row = SimpleNamespace(
        exercise_id=uuid.UUID(ex_id),
        sets_completed=1,
        reps_completed=[],
        duration_seconds=0,
        calories_burned=0.0,
        is_completed=False,
    )
    active = SimpleNamespace(
        id=uuid.uuid4(),
        sequence_day=2,
        date=datetime(2024, 1, 5, 12, 0, 0, tzinfo=UTC),
        exercises=[ex_row],
    )
    mock_repo = MagicMock()
    mock_repo.get_for_user.return_value = active
    mock_repo_cls.return_value = mock_repo

    UserChallengeService.save_challenge_progress(
        UID,
        CID,
        {
            "sequence_day": 2,
            "date": "2024-01-05T12:00:00+00:00",
            "exercises": [{"exercise_id": ex_id, "sets_completed": 3}],
        },
    )
    assert ex_row.sets_completed == 3


@patch("app.services.user_challenge_service.db.session.flush")
@patch("app.services.user_challenge_service.db.session.delete")
@patch("app.services.user_challenge_service.ActiveChallengeRepository")
def test_save_challenge_progress_switches_day_clears_exercises(
    mock_repo_cls: MagicMock, _delete: MagicMock, _flush: MagicMock
) -> None:
    ex_id = str(uuid.uuid4())
    active = SimpleNamespace(
        id=uuid.uuid4(),
        sequence_day=1,
        date=datetime(2024, 1, 1, tzinfo=UTC),
        exercises=[SimpleNamespace()],
    )
    mock_repo = MagicMock()
    mock_repo.get_for_user.return_value = active
    mock_repo_cls.return_value = mock_repo

    UserChallengeService.save_challenge_progress(
        UID,
        CID,
        {
            "sequence_day": 2,
            "date": "2024-01-02T12:00:00+00:00",
            "exercises": [{"exercise_id": ex_id}],
        },
    )
    _delete.assert_called()
    mock_repo.add_exercise.assert_called()


@patch("app.services.user_challenge_service.CompletedChallengeDayRepository")
def test_save_completed_challenge_propagates_save_error(mock_cc: MagicMock) -> None:
    mock_cc.return_value.save.side_effect = OSError("disk")
    with pytest.raises(OSError, match="disk"):
        UserChallengeService.save_completed_challenge(
            UID,
            {
                "challenge_id": CID,
                "sequence_day": 1,
                "date": "2024-01-01T00:00:00+00:00",
                "exercises": [],
            },
        )


@patch("app.services.user_challenge_service.db.session.flush")
@patch("app.services.user_challenge_service.db.session.delete")
@patch("app.services.user_challenge_service.ActiveChallengeRepository")
@patch("app.services.user_challenge_service.CompletedChallengeDayRepository")
def test_save_completed_challenge_deletes_active(
    mock_cc: MagicMock, mock_ac: MagicMock, _delete: MagicMock, _flush: MagicMock
) -> None:
    mock_cc.return_value.save = MagicMock()
    active = SimpleNamespace()
    mock_ac.return_value.get_for_user.return_value = active

    UserChallengeService.save_completed_challenge(
        UID,
        {
            "challenge_id": CID,
            "sequence_day": 1,
            "date": "2024-01-01T00:00:00+00:00",
            "exercises": [{"exercise_id": str(uuid.uuid4()), "duration_seconds": 10}],
        },
    )
    _delete.assert_called_with(active)
