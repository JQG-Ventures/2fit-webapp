"""Pure unit tests for ``UserWorkoutService`` helpers (no database)."""

from __future__ import annotations

from datetime import UTC, datetime

import pytest

from app.services.user_workout_service import UserWorkoutService


@pytest.mark.unit
def test_calculate_week_number_first_week() -> None:
    start = datetime(2024, 1, 1, tzinfo=UTC)
    done = datetime(2024, 1, 3, tzinfo=UTC)
    assert UserWorkoutService.calculate_week_number(start, done) == 1


@pytest.mark.unit
def test_calculate_week_number_second_week() -> None:
    start = datetime(2024, 1, 1, tzinfo=UTC)
    done = datetime(2024, 1, 10, tzinfo=UTC)
    assert UserWorkoutService.calculate_week_number(start, done) == 2
