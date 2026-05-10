"""HTTP tests for ``/api/workouts/*``."""

from __future__ import annotations

import uuid
from unittest.mock import patch

import pytest

from tests.db_checks import postgres_reachable
from tests.factories import ExerciseFactory
from tests.helpers.jwt_headers import auth_headers
from tests.support.workout_payload import workout_plan_create_dict

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_plans_get_unauthorized(client, db) -> None:
    r = client.get("/api/workouts/plans")
    assert r.status_code == 401


def test_plans_get_success(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/plans", headers=headers)
    assert r.status_code == 200
    assert r.get_json()["status"] == "success"


def test_plans_post_missing_body(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/workouts/plans", headers=headers)
    assert r.status_code == 415


def test_plans_post_creates_plan(app, client, db, sample_user, sample_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    payload = workout_plan_create_dict(str(sample_exercise.id))
    r = client.post("/api/workouts/plans", headers=headers, json=payload)
    assert r.status_code == 201
    body = r.get_json()
    assert body["status"] == "success"


def test_plan_get_not_found(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get(f"/api/workouts/plans/{uuid.uuid4()}", headers=headers)
    assert r.status_code == 404


def test_plan_get_success(app, client, db, sample_user, plan_with_one_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.get(f"/api/workouts/plans/{pid}", headers=headers)
    assert r.status_code == 200
    assert r.get_json()["message"]["name"] == plan_with_one_exercise.plan.name


def test_plan_delete_soft(app, client, db, sample_user, plan_with_one_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.delete(f"/api/workouts/plans/{pid}", headers=headers)
    assert r.status_code == 200


def test_plan_put_null_json_returns_400(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}",
        headers=headers,
        data="null",
        content_type="application/json",
    )
    assert r.status_code == 400
    assert "Missing JSON body" in (r.get_json() or {}).get("message", "")


def test_plan_put_validation_error(app, client, db, sample_user, plan_with_one_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(f"/api/workouts/plans/{pid}", headers=headers, json={})
    assert r.status_code == 400
    assert (r.get_json() or {}).get("status") == "error"


def test_plan_put_not_found(app, client, db, sample_user, sample_exercise) -> None:
    headers = auth_headers(app, str(sample_user.id))
    payload = workout_plan_create_dict(str(sample_exercise.id))
    r = client.put(f"/api/workouts/plans/{uuid.uuid4()}", headers=headers, json=payload)
    assert r.status_code == 404
    assert "not found" in (r.get_json() or {}).get("message", "").lower()


def test_plan_put_updates_plan_and_schedule(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    replacement = ExerciseFactory.create(name="Updated exercise")
    db.session.commit()
    pid = str(plan_with_one_exercise.plan.id)
    payload = workout_plan_create_dict(str(replacement.id))
    payload["name"] = "Updated Plan"
    payload["description"] = "Updated description"

    r = client.put(f"/api/workouts/plans/{pid}", headers=headers, json=payload)
    assert r.status_code == 200
    assert (r.get_json() or {}).get("status") == "success"

    refreshed = client.get(f"/api/workouts/plans/{pid}", headers=headers)
    assert refreshed.status_code == 200
    body = refreshed.get_json() or {}
    assert body["message"]["name"] == "Updated Plan"
    assert body["message"]["workout_schedule"][0]["exercises"][0]["exercise_id"] == str(
        replacement.id
    )


@patch("app.routes.workouts.WorkoutPlanRepository.update", side_effect=RuntimeError("boom"))
def test_plan_put_unexpected_error_returns_500(
    _mock_update, app, client, db, sample_user, plan_with_one_exercise, sample_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    payload = workout_plan_create_dict(str(sample_exercise.id))
    r = client.put(f"/api/workouts/plans/{pid}", headers=headers, json=payload)
    assert r.status_code == 500
    assert "boom" in (r.get_json() or {}).get("message", "")


def test_one_day_plans_get(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/plans/one-day", headers=headers)
    assert r.status_code == 200


def test_saved_get_empty(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/saved", headers=headers)
    assert r.status_code == 200
    assert r.get_json()["message"] == []


def test_saved_post_missing_workout_id(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/workouts/saved", headers=headers)
    assert r.status_code == 400
    assert "workout_id" in (r.get_json() or {}).get("message", "")


def test_saved_post_and_delete(app, client, db, sample_user, sample_workout_plan) -> None:
    headers = auth_headers(app, str(sample_user.id))
    wid = str(sample_workout_plan.id)
    r = client.post(f"/api/workouts/saved?workout_id={wid}", headers=headers)
    assert r.status_code == 200
    r2 = client.delete(f"/api/workouts/saved?workout_id={wid}", headers=headers)
    assert r2.status_code == 200


def test_home_explore(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/home/explore", headers=headers)
    assert r.status_code == 200


def test_home_by_level_invalid(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/home/by-level?level=expert", headers=headers)
    assert r.status_code == 400


def test_home_by_level_all(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/home/by-level?level=all", headers=headers)
    assert r.status_code == 200


def test_library_not_found_or_success(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/library", headers=headers)
    assert r.status_code in (200, 404)


def test_library_difficulty_not_found(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/library/difficulty/advanced", headers=headers)
    assert r.status_code in (200, 404)


def test_popular_get(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/popular", headers=headers)
    assert r.status_code == 200


@patch("app.routes.workouts.UserWorkoutService.get_weekly_workout_progress")
def test_weekly_progress(mock_g, app, client, db, sample_user) -> None:
    mock_g.return_value = {"progress": 0.0, "days": []}
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/weekly-progress", headers=headers)
    assert r.status_code == 200


def test_challenge_progress_missing_id(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/challenge-progress", headers=headers)
    assert r.status_code == 400


@patch("app.routes.workouts.UserWorkoutService.get_challenge_progress")
def test_challenge_progress_ok(mock_c, app, client, db, sample_user) -> None:
    mock_c.return_value = {"completed": 0}
    headers = auth_headers(app, str(sample_user.id))
    cid = str(uuid.uuid4())
    r = client.get(f"/api/workouts/challenge-progress?challenge_id={cid}", headers=headers)
    assert r.status_code == 200


def test_delete_exercises_missing_body(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(f"/api/workouts/plans/{pid}/delete-exercises", headers=headers)
    assert r.status_code == 415


def test_delete_exercises_null_json_returns_400(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}/delete-exercises",
        headers=headers,
        data="null",
        content_type="application/json",
    )
    assert r.status_code == 400
    assert "Missing JSON body" in (r.get_json() or {}).get("message", "")


def test_update_exercises_missing_body(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(f"/api/workouts/plans/{pid}/update-exercises", headers=headers)
    assert r.status_code == 415


def test_update_exercises_null_json_returns_400(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}/update-exercises",
        headers=headers,
        data="null",
        content_type="application/json",
    )
    assert r.status_code == 400
    assert "Missing JSON body" in (r.get_json() or {}).get("message", "")


def test_plans_bulk_validation(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.post("/api/workouts/plans/bulk", headers=headers, json=[{}])
    assert r.status_code == 400


def test_weekly_progress_invalid_week_number(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/workouts/weekly-progress?week_number=not-a-number", headers=headers)
    assert r.status_code == 400
    assert "Invalid" in (r.get_json() or {}).get("message", "")


def test_delete_exercises_instance_requires_week(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}/delete-exercises",
        headers=headers,
        json={"scope": "instance", "monday": [str(uuid.uuid4())]},
    )
    assert r.status_code == 400
    assert "week_number" in (r.get_json() or {}).get("message", "").lower()


def test_delete_exercises_instance_invalid_week_number(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}/delete-exercises",
        headers=headers,
        json={"scope": "instance", "week_number": "bad", "monday": [str(uuid.uuid4())]},
    )
    assert r.status_code == 400
    assert "invalid week_number" in (r.get_json() or {}).get("message", "").lower()


def test_delete_exercises_plan_not_found(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.put(
        f"/api/workouts/plans/{uuid.uuid4()}/delete-exercises",
        headers=headers,
        json={"monday": [str(uuid.uuid4())]},
    )
    assert r.status_code == 404
    assert "not found" in (r.get_json() or {}).get("message", "").lower()


@patch("app.routes.workouts.UserWorkoutService.apply_template_deletes")
def test_delete_exercises_template_success(
    mock_delete, app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    payload = {"monday": [str(uuid.uuid4())]}
    r = client.put(
        f"/api/workouts/plans/{pid}/delete-exercises",
        headers=headers,
        json=payload,
    )
    assert r.status_code == 200
    mock_delete.assert_called_once()
    assert mock_delete.call_args[0][0] == str(sample_user.id)
    assert mock_delete.call_args[0][1].id == plan_with_one_exercise.plan.id
    assert mock_delete.call_args[0][2] == payload


@patch("app.routes.workouts.UserWorkoutService.apply_instance_deletes")
def test_delete_exercises_instance_success(
    mock_delete, app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    payload = {"scope": "instance", "week_number": "2", "monday": [str(uuid.uuid4())]}
    r = client.put(
        f"/api/workouts/plans/{pid}/delete-exercises",
        headers=headers,
        json=payload,
    )
    assert r.status_code == 200
    mock_delete.assert_called_once_with(
        str(sample_user.id),
        plan_with_one_exercise.plan.id,
        2,
        {"monday": payload["monday"]},
    )


@patch(
    "app.routes.workouts.UserWorkoutService.apply_template_deletes",
    side_effect=ValueError("bad delete"),
)
def test_delete_exercises_value_error_returns_400(
    _mock_delete, app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}/delete-exercises",
        headers=headers,
        json={"monday": [str(uuid.uuid4())]},
    )
    assert r.status_code == 400
    assert "bad delete" in (r.get_json() or {}).get("message", "")


@patch(
    "app.routes.workouts.UserWorkoutService.apply_instance_deletes",
    side_effect=RuntimeError("boom"),
)
def test_delete_exercises_unexpected_error_returns_500(
    _mock_delete, app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}/delete-exercises",
        headers=headers,
        json={"scope": "instance", "week_number": 3, "monday": [str(uuid.uuid4())]},
    )
    assert r.status_code == 500
    assert "boom" in (r.get_json() or {}).get("message", "")


def test_update_exercises_instance_requires_week(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}/update-exercises",
        headers=headers,
        json={
            "scope": "instance",
            "monday": [{"old_exercise_id": "x", "new_exercise": str(uuid.uuid4())}],
        },
    )
    assert r.status_code == 400
    assert "week_number" in (r.get_json() or {}).get("message", "").lower()


def test_update_exercises_instance_invalid_week_number(
    app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}/update-exercises",
        headers=headers,
        json={
            "scope": "instance",
            "week_number": "bad",
            "monday": [{"old_exercise_id": str(uuid.uuid4()), "new_exercise": str(uuid.uuid4())}],
        },
    )
    assert r.status_code == 400
    assert "invalid week_number" in (r.get_json() or {}).get("message", "").lower()


def test_update_exercises_plan_not_found(app, client, db, sample_user) -> None:
    headers = auth_headers(app, str(sample_user.id))
    r = client.put(
        f"/api/workouts/plans/{uuid.uuid4()}/update-exercises",
        headers=headers,
        json={
            "monday": [{"old_exercise_id": str(uuid.uuid4()), "new_exercise": str(uuid.uuid4())}]
        },
    )
    assert r.status_code == 404
    assert "not found" in (r.get_json() or {}).get("message", "").lower()


@patch("app.routes.workouts.UserWorkoutService.apply_template_replacements")
def test_update_exercises_template_success(
    mock_replace, app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    payload = {
        "monday": [{"old_exercise_id": str(uuid.uuid4()), "new_exercise": str(uuid.uuid4())}]
    }
    r = client.put(
        f"/api/workouts/plans/{pid}/update-exercises",
        headers=headers,
        json=payload,
    )
    assert r.status_code == 200
    mock_replace.assert_called_once()
    assert mock_replace.call_args[0][0] == str(sample_user.id)
    assert mock_replace.call_args[0][1].id == plan_with_one_exercise.plan.id
    assert mock_replace.call_args[0][2] == payload


@patch("app.routes.workouts.UserWorkoutService.apply_instance_replacements")
def test_update_exercises_instance_success(
    mock_replace, app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    payload = {
        "scope": "instance",
        "week_number": "4",
        "monday": [{"old_exercise_id": str(uuid.uuid4()), "new_exercise": str(uuid.uuid4())}],
    }
    r = client.put(
        f"/api/workouts/plans/{pid}/update-exercises",
        headers=headers,
        json=payload,
    )
    assert r.status_code == 200
    mock_replace.assert_called_once_with(
        str(sample_user.id),
        plan_with_one_exercise.plan.id,
        4,
        {"monday": payload["monday"]},
    )


@patch(
    "app.routes.workouts.UserWorkoutService.apply_template_replacements",
    side_effect=ValueError("bad replace"),
)
def test_update_exercises_value_error_returns_400(
    _mock_replace, app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}/update-exercises",
        headers=headers,
        json={
            "monday": [{"old_exercise_id": str(uuid.uuid4()), "new_exercise": str(uuid.uuid4())}]
        },
    )
    assert r.status_code == 400
    assert "bad replace" in (r.get_json() or {}).get("message", "")


@patch(
    "app.routes.workouts.UserWorkoutService.apply_instance_replacements",
    side_effect=RuntimeError("boom"),
)
def test_update_exercises_unexpected_error_returns_500(
    _mock_replace, app, client, db, sample_user, plan_with_one_exercise
) -> None:
    headers = auth_headers(app, str(sample_user.id))
    pid = str(plan_with_one_exercise.plan.id)
    r = client.put(
        f"/api/workouts/plans/{pid}/update-exercises",
        headers=headers,
        json={
            "scope": "instance",
            "week_number": 4,
            "monday": [{"old_exercise_id": str(uuid.uuid4()), "new_exercise": str(uuid.uuid4())}],
        },
    )
    assert r.status_code == 500
    assert "boom" in (r.get_json() or {}).get("message", "")
