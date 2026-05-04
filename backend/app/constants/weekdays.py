"""Canonical weekday constants and helpers."""

from enum import StrEnum


class Weekday(StrEnum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


WEEKDAY_ORDER: tuple[str, ...] = tuple(day.value for day in Weekday)
WEEKDAY_SET: set[str] = set(WEEKDAY_ORDER)


def normalize_weekday(day: str) -> str:
    """Normalize a weekday string for comparisons/storage."""
    return day.strip().lower()


def is_valid_weekday(day: str) -> bool:
    """Return ``True`` when a weekday is one of the canonical values."""
    return normalize_weekday(day) in WEEKDAY_SET
