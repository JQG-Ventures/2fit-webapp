"""Unit tests for ``UserWorkoutService`` (repositories and ``db`` mocked)."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from app.services.user_workout_service import UserWorkoutService

pytestmark = pytest.mark.unit


def _dt_proxy(fixed_now: datetime) -> type:
    """Replaces ``datetime`` in ``user_workout_service`` (``now`` is not patchable on the class)."""

    class _DtProxy:
        @staticmethod
        def now(tz=None):
            return fixed_now

        fromisoformat = staticmethod(datetime.fromisoformat)

    return _DtProxy


UID = str(uuid.uuid4())
PID = str(uuid.uuid4())
E1 = uuid.uuid4()
E2 = uuid.uuid4()


def test_calculate_week_number_first_week() -> None:
    start = datetime(2024, 1, 1, tzinfo=UTC)
    done = datetime(2024, 1, 3, tzinfo=UTC)
    assert UserWorkoutService.calculate_week_number(start, done) == 1


def test_calculate_week_number_second_week() -> None:
    start = datetime(2024, 1, 1, tzinfo=UTC)
    done = datetime(2024, 1, 10, tzinfo=UTC)
    assert UserWorkoutService.calculate_week_number(start, done) == 2


def test_calculate_week_number_handles_naive_completed_date() -> None:
    start = datetime(2024, 1, 1, tzinfo=UTC)
    done = datetime(2024, 1, 10)
    assert UserWorkoutService.calculate_week_number(start, done) == 2


@patch("app.services.user_workout_service.db.session.flush")
@patch("app.services.user_workout_service.CompletedWorkoutRepository")
def test_save_completed_workout_calls_repo(mock_repo_cls: MagicMock, _flush: MagicMock) -> None:
    mock_repo = MagicMock()
    mock_repo_cls.return_value = mock_repo
    payload = {
        "date": "2024-06-01T12:00:00+00:00",
        "workout_id": PID,
        "exercises": [{"exercise_id": str(E1), "sets_completed": 2}],
    }
    UserWorkoutService.save_completed_workout(UID, payload.copy())
    mock_repo.save.assert_called_once()
    args = mock_repo.save.call_args[0]
    assert args[0] == uuid.UUID(UID)


@patch("app.services.user_workout_service.db.session.flush")
@patch("app.services.user_workout_service.CompletedWorkoutRepository")
def test_save_completed_workout_propagates_exception(
    mock_repo_cls: MagicMock, _flush: MagicMock
) -> None:
    mock_repo_cls.return_value.save.side_effect = ValueError("boom")
    with pytest.raises(ValueError, match="boom"):
        UserWorkoutService.save_completed_workout(UID, {"exercises": []})


@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_get_user_progress_raises_when_no_active(mock_ap_cls: MagicMock, _wp: MagicMock) -> None:
    mock_ap_cls.return_value.get_active_for_user.return_value = None
    with pytest.raises(Exception, match="Active plan not found"):
        UserWorkoutService.get_user_progress(UID, PID)


@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_get_user_progress_raises_when_plan_missing(
    mock_ap_cls: MagicMock, mock_wp_cls: MagicMock
) -> None:
    mock_ap_cls.return_value.get_active_for_user.return_value = SimpleNamespace(
        plan_type="personalized"
    )
    mock_wp_cls.return_value.get_with_schedule.return_value = None
    with pytest.raises(RuntimeError, match="Cannot get workout plan"):
        UserWorkoutService.get_user_progress(UID, PID)


@patch("app.services.user_workout_service.UserWorkoutService._calc_personalized_progress")
@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_get_user_progress_personalized_branch(
    mock_ap_cls: MagicMock, mock_wp_cls: MagicMock, mock_calc: MagicMock
) -> None:
    active = SimpleNamespace(plan_type="personalized")
    plan = SimpleNamespace()
    mock_ap_cls.return_value.get_active_for_user.return_value = active
    mock_wp_cls.return_value.get_with_schedule.return_value = plan
    mock_calc.return_value = (42.5, [{"exercise_id": "x"}])
    out = UserWorkoutService.get_user_progress(UID, PID)
    assert out == {"progress": 42.5, "exercises_left": [{"exercise_id": "x"}]}
    mock_calc.assert_called_once_with(active, plan)


@patch("app.services.user_workout_service.UserWorkoutService._calc_challenge_progress")
@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_get_user_progress_challenge_branch(
    mock_ap_cls: MagicMock, mock_wp_cls: MagicMock, mock_calc: MagicMock
) -> None:
    active = SimpleNamespace(plan_type="challenge")
    wp = SimpleNamespace()
    mock_ap_cls.return_value.get_active_for_user.return_value = active
    mock_wp_cls.return_value.get_with_schedule.return_value = wp
    mock_calc.return_value = (10.0, [])
    assert UserWorkoutService.get_user_progress(UID, PID) == {
        "progress": 10.0,
        "exercises_left": [],
    }


@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_get_user_progress_other_plan_type_returns_zero(
    mock_ap_cls: MagicMock, mock_wp_cls: MagicMock
) -> None:
    mock_ap_cls.return_value.get_active_for_user.return_value = SimpleNamespace(plan_type="library")
    mock_wp_cls.return_value.get_with_schedule.return_value = SimpleNamespace()
    assert UserWorkoutService.get_user_progress(UID, PID) == {
        "progress": 0.0,
        "exercises_left": [],
    }


@patch(
    "app.services.user_workout_service.datetime",
    new=_dt_proxy(datetime(2024, 1, 3, 12, 0, 0, tzinfo=UTC)),
)
def test_calc_personalized_no_matching_weekday_returns_empty() -> None:
    active = SimpleNamespace(
        start_date=datetime(2024, 1, 1, tzinfo=UTC),
        progress_details=[],
    )
    wp = SimpleNamespace(workout_days=[SimpleNamespace(day_of_week="monday", exercises=[])])
    p, left = UserWorkoutService._calc_personalized_progress(active, wp)
    assert p == 0.0 and left == []


@patch(
    "app.services.user_workout_service.datetime",
    new=_dt_proxy(datetime(2024, 1, 3, 12, 0, 0, tzinfo=UTC)),
)
def test_calc_personalized_with_progress() -> None:
    ex = SimpleNamespace(exercise_id=E1, sets=4, reps=8, rest_seconds=60)
    dp_ex = SimpleNamespace(exercise_id=E1, sets_completed=2)
    active = SimpleNamespace(
        start_date=datetime(2024, 1, 1, tzinfo=UTC),
        progress_details=[
            SimpleNamespace(day_of_week="wednesday", week_number=1, exercises=[dp_ex])
        ],
    )
    wp = SimpleNamespace(workout_days=[SimpleNamespace(day_of_week="wednesday", exercises=[ex])])
    p, left = UserWorkoutService._calc_personalized_progress(active, wp)
    assert p == 50.0
    assert len(left) == 1
    assert left[0]["sets_left"] == 2


@patch(
    "app.services.user_workout_service.datetime", new=_dt_proxy(datetime(2024, 1, 2, tzinfo=UTC))
)
def test_calc_challenge_progress() -> None:
    ex_row = dict(sets=2, reps=8, rest_seconds=0)
    d1 = SimpleNamespace(
        sequence_day=1,
        exercises=[SimpleNamespace(exercise_id=E1, **ex_row)],
    )
    d2 = SimpleNamespace(
        sequence_day=2,
        exercises=[SimpleNamespace(exercise_id=E2, **ex_row)],
    )
    active_plan = SimpleNamespace(
        start_date=datetime(2024, 1, 1, tzinfo=UTC),
        progress_details=[
            SimpleNamespace(is_completed=True, sequence_day=1, exercises=[]),
            SimpleNamespace(
                is_completed=False,
                sequence_day=2,
                exercises=[SimpleNamespace(exercise_id=E1, is_completed=True)],
            ),
        ],
    )
    wp = SimpleNamespace(workout_days=[d1, d2])
    p, left = UserWorkoutService._calc_challenge_progress(active_plan, wp)
    assert p == 50.0
    assert len(left) >= 0


@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_get_weekly_no_active_raises(mock_ap: MagicMock, _wp: MagicMock) -> None:
    mock_ap.return_value.get_by_user.return_value = []
    with pytest.raises(Exception, match="No active workout plan"):
        UserWorkoutService.get_weekly_workout_progress(UID)


@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_get_weekly_no_workout_plan_raises(mock_ap: MagicMock, mock_wp: MagicMock) -> None:
    mock_ap.return_value.get_by_user.return_value = [
        SimpleNamespace(is_completed=False, plan_type="personalized", workout_plan_id=uuid.uuid4())
    ]
    mock_wp.return_value.get_with_schedule.return_value = None
    with pytest.raises(Exception, match="Workout plan not found"):
        UserWorkoutService.get_weekly_workout_progress(UID)


@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_get_weekly_past_duration_returns_empty(mock_ap: MagicMock, mock_wp: MagicMock) -> None:
    ap_id = uuid.uuid4()
    mock_ap.return_value.get_by_user.return_value = [
        SimpleNamespace(
            is_completed=False,
            plan_type="personalized",
            workout_plan_id=ap_id,
            start_date=datetime(2020, 1, 1, tzinfo=UTC),
            progress_details=[],
        )
    ]
    mock_wp.return_value.get_with_schedule.return_value = SimpleNamespace(
        duration_weeks=1, workout_days=[]
    )
    with patch(
        "app.services.user_workout_service.datetime",
        new=_dt_proxy(datetime(2025, 1, 1, tzinfo=UTC)),
    ):
        out = UserWorkoutService.get_weekly_workout_progress(UID)
    assert out["progress"] == 0.0 and out["days"] == []


@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_get_weekly_builds_days(mock_ap: MagicMock, mock_wp: MagicMock) -> None:
    wpid = uuid.uuid4()
    ex_obj = SimpleNamespace(
        name="Push-up",
        difficulty="easy",
        description="d",
        image_url="i",
        video_url="v",
    )
    wde = SimpleNamespace(
        exercise_id=E1,
        sets=2,
        reps=10,
        rest_seconds=30,
        exercise=ex_obj,
    )
    day = SimpleNamespace(day_of_week="monday", exercises=[wde])
    mock_ap.return_value.get_by_user.return_value = [
        SimpleNamespace(
            id=uuid.uuid4(),
            is_completed=False,
            plan_type="personalized",
            workout_plan_id=wpid,
            start_date=datetime(2024, 1, 1, tzinfo=UTC),
            progress_details=[],
        )
    ]
    mock_wp.return_value.get_with_schedule.return_value = SimpleNamespace(
        duration_weeks=4,
        workout_days=[day],
    )
    with patch(
        "app.services.user_workout_service.datetime",
        new=_dt_proxy(datetime(2024, 1, 1, 12, 0, 0, tzinfo=UTC)),
    ):
        out = UserWorkoutService.get_weekly_workout_progress(UID)
    assert "days" in out and out["week_start_date"]
    assert any(d["day_of_week"] == "monday" for d in out["days"])


@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_get_weekly_accepts_requested_week(mock_ap: MagicMock, mock_wp: MagicMock) -> None:
    wpid = uuid.uuid4()
    ex_obj = SimpleNamespace(
        name="Push-up",
        difficulty="easy",
        description="d",
        image_url="i",
        video_url="v",
    )
    wde = SimpleNamespace(
        exercise_id=E1,
        sets=2,
        reps=10,
        rest_seconds=30,
        exercise=ex_obj,
    )
    day = SimpleNamespace(day_of_week="monday", exercises=[wde])
    progress_detail = SimpleNamespace(
        week_number=2,
        day_of_week="monday",
        exercises=[SimpleNamespace(exercise_id=E1, is_completed=True)],
    )
    mock_ap.return_value.get_by_user.return_value = [
        SimpleNamespace(
            id=uuid.uuid4(),
            is_completed=False,
            plan_type="personalized",
            workout_plan_id=wpid,
            start_date=datetime(2024, 1, 1, tzinfo=UTC),
            progress_details=[progress_detail],
        )
    ]
    mock_wp.return_value.get_with_schedule.return_value = SimpleNamespace(
        duration_weeks=4,
        workout_days=[day],
    )

    with patch(
        "app.services.user_workout_service.datetime",
        new=_dt_proxy(datetime(2024, 1, 1, 12, 0, 0, tzinfo=UTC)),
    ):
        out = UserWorkoutService.get_weekly_workout_progress(UID, week_number=2)

    assert out["current_week"] == 1
    assert out["week_number"] == 2
    assert out["total_weeks"] == 4
    assert out["week_start_date"] == "2024-01-08"
    assert out["days"][0]["is_completed"] is True


@patch("app.services.user_workout_service.CompletedChallengeDayRepository")
@patch("app.services.user_workout_service.ActiveChallengeRepository")
@patch("app.services.user_workout_service.ChallengeRepository")
def test_get_challenge_progress_not_found(
    mock_cr: MagicMock, _ac: MagicMock, _ccd: MagicMock
) -> None:
    mock_cr.return_value.get_with_schedule.return_value = None
    with pytest.raises(Exception, match="Challenge not found"):
        UserWorkoutService.get_challenge_progress(UID, str(uuid.uuid4()))


@patch("app.services.user_workout_service.CompletedChallengeDayRepository")
@patch("app.services.user_workout_service.ActiveChallengeRepository")
@patch("app.services.user_workout_service.ChallengeRepository")
def test_get_challenge_progress_no_start(
    mock_cr: MagicMock, mock_ac: MagicMock, mock_ccd: MagicMock
) -> None:
    cid = uuid.uuid4()
    mock_cr.return_value.get_with_schedule.return_value = SimpleNamespace(
        name="C", challenge_days=[SimpleNamespace(sequence_day=1, exercises=[])]
    )
    mock_ac.return_value.get_for_user.return_value = None
    mock_ccd.return_value.get_by_user_challenge.return_value = []
    with pytest.raises(Exception, match="No challenge started"):
        UserWorkoutService.get_challenge_progress(UID, str(cid))


@patch(
    "app.services.user_workout_service.datetime",
    new=_dt_proxy(datetime(2024, 6, 15, tzinfo=UTC)),
)
@patch("app.services.user_workout_service.CompletedChallengeDayRepository")
@patch("app.services.user_workout_service.ActiveChallengeRepository")
@patch("app.services.user_workout_service.ChallengeRepository")
def test_get_challenge_progress_with_active(
    mock_cr: MagicMock, mock_ac: MagicMock, _ccd: MagicMock
) -> None:
    cid = uuid.uuid4()
    cde = SimpleNamespace(
        exercise_id=E1,
        sets=1,
        reps=5,
        rest_seconds=0,
        exercise=SimpleNamespace(name="A", image_url=""),
    )
    cday = SimpleNamespace(sequence_day=1, exercises=[cde])
    mock_cr.return_value.get_with_schedule.return_value = SimpleNamespace(
        name="Challenge", challenge_days=[cday]
    )
    mock_ac.return_value.get_for_user.return_value = SimpleNamespace(
        date=datetime(2024, 6, 10, tzinfo=UTC),
        sequence_day=1,
        exercises=[],
    )
    out = UserWorkoutService.get_challenge_progress(UID, str(cid))
    assert out["name"] == "Challenge" and out["total_days"] == 1


@patch(
    "app.services.user_workout_service.datetime",
    new=_dt_proxy(datetime(2024, 6, 20, tzinfo=UTC)),
)
@patch("app.services.user_workout_service.CompletedChallengeDayRepository")
@patch("app.services.user_workout_service.ActiveChallengeRepository")
@patch("app.services.user_workout_service.ChallengeRepository")
def test_get_challenge_progress_completed_only_derives_start(
    mock_cr: MagicMock, mock_ac: MagicMock, mock_ccd: MagicMock
) -> None:
    cid = uuid.uuid4()
    cde = SimpleNamespace(
        exercise_id=E1,
        sets=1,
        reps=1,
        rest_seconds=0,
        exercise=SimpleNamespace(name="B", image_url=""),
    )
    cday = SimpleNamespace(sequence_day=1, exercises=[cde])
    mock_cr.return_value.get_with_schedule.return_value = SimpleNamespace(
        name="C2", challenge_days=[cday]
    )
    mock_ac.return_value.get_for_user.return_value = None
    cd = SimpleNamespace(
        sequence_day=1,
        date=datetime(2024, 6, 10, tzinfo=UTC),
        exercises=[SimpleNamespace(exercise_id=E1, is_completed=True)],
    )
    mock_ccd.return_value.get_by_user_challenge.return_value = [cd]
    out = UserWorkoutService.get_challenge_progress(UID, str(cid))
    assert out["progress"] == 100.0


@patch("app.services.user_workout_service.db.session.flush")
@patch("app.services.user_workout_service.db.session.refresh")
@patch("app.services.user_workout_service.DayProgressRepository")
@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_save_workout_progress_completes_day(
    mock_ap_cls: MagicMock,
    mock_wp_cls: MagicMock,
    mock_dp_cls: MagicMock,
    _refresh: MagicMock,
    _flush: MagicMock,
) -> None:
    wpid = uuid.uuid4()
    wday = SimpleNamespace(
        day_of_week="monday",
        sequence_day=1,
        exercises=[SimpleNamespace(exercise_id=E1)],
    )
    active = SimpleNamespace(
        id=uuid.uuid4(),
        start_date=datetime(2024, 1, 1, tzinfo=UTC),
        progress_details=[],
        is_completed=False,
    )
    day_prog = SimpleNamespace(
        id=uuid.uuid4(),
        exercises=[SimpleNamespace(exercise_id=E1, is_completed=True)],
        is_completed=False,
    )
    mock_ap_cls.return_value.get_active_for_user.return_value = active
    mock_wp_cls.return_value.get_with_schedule.return_value = SimpleNamespace(
        workout_days=[wday], duration_weeks=1
    )
    mock_dp = MagicMock()
    mock_dp.find_or_create.return_value = day_prog
    mock_dp_cls.return_value = mock_dp

    UserWorkoutService.save_workout_progress(
        UID,
        str(wpid),
        {
            "day_of_week": "monday",
            "date": "2024-01-01T12:00:00+00:00",
            "exercises": [{"exercise_id": str(E1), "is_completed": True}],
        },
    )
    mock_dp.add_exercise_progress.assert_called_once()
    mock_dp.find_or_create.assert_called_once_with(
        active_plan_id=active.id,
        week_number=1,
        day_of_week="monday",
        sequence_day=None,
    )
    assert day_prog.is_completed is True
    assert active.progress == 100.0
    assert active.is_completed is True


@patch("app.services.user_workout_service.db.session.flush")
@patch("app.services.user_workout_service.db.session.refresh")
@patch("app.services.user_workout_service.DayProgressRepository")
@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_save_workout_progress_keeps_day_incomplete_until_all_scheduled_done(
    mock_ap_cls: MagicMock,
    mock_wp_cls: MagicMock,
    mock_dp_cls: MagicMock,
    _refresh: MagicMock,
    _flush: MagicMock,
) -> None:
    wday = SimpleNamespace(
        day_of_week="sunday",
        sequence_day=7,
        exercises=[SimpleNamespace(exercise_id=E1), SimpleNamespace(exercise_id=E2)],
    )
    active = SimpleNamespace(
        id=uuid.uuid4(),
        start_date=datetime(2024, 1, 1, tzinfo=UTC),
        progress_details=[],
        is_completed=False,
        progress=0.0,
    )
    day_prog = SimpleNamespace(
        id=uuid.uuid4(),
        exercises=[SimpleNamespace(exercise_id=E1, is_completed=True)],
        is_completed=False,
    )
    mock_ap_cls.return_value.get_active_for_user.return_value = active
    mock_wp_cls.return_value.get_with_schedule.return_value = SimpleNamespace(
        workout_days=[wday], duration_weeks=1
    )
    mock_dp = MagicMock()
    mock_dp.find_or_create.return_value = day_prog
    mock_dp_cls.return_value = mock_dp

    UserWorkoutService.save_workout_progress(
        UID,
        PID,
        {
            "day_of_week": "sunday",
            "date": "2024-01-07T12:00:00+00:00",
            "exercises": [{"exercise_id": str(E1), "is_completed": True}],
        },
    )

    assert day_prog.is_completed is False
    assert active.progress == 0.0
    assert active.is_completed is False


@patch("app.services.user_workout_service.db.session.flush")
@patch("app.services.user_workout_service.db.session.refresh")
@patch("app.services.user_workout_service.DayProgressRepository")
@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_save_workout_progress_supports_sequence_day(
    mock_ap_cls: MagicMock,
    mock_wp_cls: MagicMock,
    mock_dp_cls: MagicMock,
    _refresh: MagicMock,
    _flush: MagicMock,
) -> None:
    wday = SimpleNamespace(
        day_of_week=None,
        sequence_day=3,
        exercises=[SimpleNamespace(exercise_id=E1)],
    )
    active = SimpleNamespace(
        id=uuid.uuid4(),
        start_date=datetime(2024, 1, 1, tzinfo=UTC),
        progress_details=[],
        is_completed=False,
        progress=0.0,
    )
    day_prog = SimpleNamespace(
        id=uuid.uuid4(),
        exercises=[SimpleNamespace(exercise_id=E1, is_completed=True)],
        is_completed=False,
    )
    mock_ap_cls.return_value.get_active_for_user.return_value = active
    mock_wp_cls.return_value.get_with_schedule.return_value = SimpleNamespace(
        workout_days=[wday], duration_weeks=1
    )
    mock_dp = MagicMock()
    mock_dp.find_or_create.return_value = day_prog
    mock_dp_cls.return_value = mock_dp

    UserWorkoutService.save_workout_progress(
        UID,
        PID,
        {
            "sequence_day": 3,
            "date": "2024-01-03T12:00:00+00:00",
            "exercises": [{"exercise_id": str(E1), "is_completed": True}],
        },
    )

    mock_dp.find_or_create.assert_called_once_with(
        active_plan_id=active.id,
        week_number=1,
        day_of_week=None,
        sequence_day=3,
    )
    assert day_prog.is_completed is True


@patch("app.services.user_workout_service.db.session.flush")
@patch("app.services.user_workout_service.db.session.refresh")
@patch("app.services.user_workout_service.DayProgressRepository")
@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_save_workout_progress_counts_existing_completed_days_without_double_counting_current(
    mock_ap_cls: MagicMock,
    mock_wp_cls: MagicMock,
    mock_dp_cls: MagicMock,
    _refresh: MagicMock,
    _flush: MagicMock,
) -> None:
    day_prog = SimpleNamespace(
        id=uuid.uuid4(),
        exercises=[SimpleNamespace(exercise_id=E2, is_completed=True)],
        is_completed=False,
    )
    previous_done = SimpleNamespace(id=uuid.uuid4(), is_completed=True)
    active = SimpleNamespace(
        id=uuid.uuid4(),
        start_date=datetime(2024, 1, 1, tzinfo=UTC),
        progress_details=[previous_done, day_prog],
        is_completed=False,
        progress=0.0,
    )
    monday = SimpleNamespace(day_of_week="monday", sequence_day=1, exercises=[])
    tuesday = SimpleNamespace(
        day_of_week="tuesday",
        sequence_day=2,
        exercises=[SimpleNamespace(exercise_id=E2)],
    )
    mock_ap_cls.return_value.get_active_for_user.return_value = active
    mock_wp_cls.return_value.get_with_schedule.return_value = SimpleNamespace(
        workout_days=[monday, tuesday], duration_weeks=1
    )
    mock_dp = MagicMock()
    mock_dp.find_or_create.return_value = day_prog
    mock_dp_cls.return_value = mock_dp

    UserWorkoutService.save_workout_progress(
        UID,
        PID,
        {
            "day_of_week": "tuesday",
            "date": "2024-01-02T12:00:00+00:00",
            "exercises": [{"exercise_id": str(E2), "is_completed": True}],
        },
    )

    assert active.progress == 100.0
    assert active.is_completed is True


@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_save_workout_progress_day_not_in_plan_raises(
    mock_ap_cls: MagicMock, mock_wp_cls: MagicMock
) -> None:
    wpid = uuid.uuid4()
    mock_ap_cls.return_value.get_active_for_user.return_value = SimpleNamespace(id=uuid.uuid4())
    mock_wp_cls.return_value.get_with_schedule.return_value = SimpleNamespace(
        workout_days=[SimpleNamespace(day_of_week="tuesday", sequence_day=1, exercises=[])]
    )
    with pytest.raises(ValueError, match="Workout day not found"):
        UserWorkoutService.save_workout_progress(
            UID,
            str(wpid),
            {"day_of_week": "friday", "exercises": []},
        )


@patch("app.services.user_workout_service.ActivePlanRepository")
def test_save_workout_progress_no_active_raises(mock_ap_cls: MagicMock) -> None:
    mock_ap_cls.return_value.get_active_for_user.return_value = None
    with pytest.raises(Exception, match="Active workout plan not found"):
        UserWorkoutService.save_workout_progress(UID, PID, {"day_of_week": "monday"})


@patch("app.services.user_workout_service.WorkoutPlanRepository")
@patch("app.services.user_workout_service.ActivePlanRepository")
def test_save_workout_progress_missing_day_id_raises(
    mock_ap_cls: MagicMock, mock_wp_cls: MagicMock
) -> None:
    mock_ap_cls.return_value.get_active_for_user.return_value = SimpleNamespace(id=uuid.uuid4())
    mock_wp_cls.return_value.get_with_schedule.return_value = SimpleNamespace(workout_days=[])
    with pytest.raises(ValueError, match="day_of_week or sequence_day"):
        UserWorkoutService.save_workout_progress(UID, PID, {"exercises": []})
