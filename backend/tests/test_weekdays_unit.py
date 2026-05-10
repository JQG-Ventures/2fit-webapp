from __future__ import annotations

import pytest

from app.constants import WEEKDAY_SET
from app.constants.weekdays import WEEKDAY_ORDER, Weekday, is_valid_weekday, normalize_weekday
from app.schemas.user import TrainingPreferencesCreate

pytestmark = pytest.mark.unit


def test_weekday_order_matches_enum_values() -> None:
    assert WEEKDAY_ORDER == tuple(day.value for day in Weekday)
    assert len(WEEKDAY_ORDER) == 7
    assert WEEKDAY_SET == set(WEEKDAY_ORDER)


def test_normalize_and_validate_weekday() -> None:
    assert normalize_weekday(" Tuesday ") == "tuesday"
    assert is_valid_weekday(" Tuesday ")
    assert not is_valid_weekday("funday")


def test_training_preferences_normalizes_available_days() -> None:
    prefs = TrainingPreferencesCreate(
        preferred_muscle_groups=[],
        equipment=[],
        available_days=["Monday", " wednesday "],
        workout_types=[],
    )
    assert prefs.available_days == ["monday", "wednesday"]


def test_training_preferences_rejects_invalid_day() -> None:
    with pytest.raises(ValueError, match="Invalid day"):
        TrainingPreferencesCreate(
            preferred_muscle_groups=[],
            equipment=[],
            available_days=["monday", "funday"],
            workout_types=[],
        )
