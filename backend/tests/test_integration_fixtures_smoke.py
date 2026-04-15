"""Smoke tests for composite DB fixtures (skipped when PostgreSQL is unavailable)."""

from __future__ import annotations

import pytest

from tests.db_checks import postgres_reachable

pytestmark = pytest.mark.integration


@pytest.mark.skipif(
    not postgres_reachable(),
    reason="PostgreSQL not reachable",
)
def test_plan_with_one_exercise_fixture(plan_with_one_exercise) -> None:
    assert plan_with_one_exercise.plan.id is not None
    assert plan_with_one_exercise.wde.exercise_id == plan_with_one_exercise.exercise.id


@pytest.mark.skipif(
    not postgres_reachable(),
    reason="PostgreSQL not reachable",
)
def test_user_saved_plan_and_active_fixture(user_saved_plan_and_active) -> None:
    bundle = user_saved_plan_and_active
    assert bundle.saved.user_id == bundle.user.id
    assert bundle.active_plan.workout_plan_id == bundle.plan.id
