"""Minimal valid ``UserCreate`` JSON for ``POST /api/auth/register``."""

from __future__ import annotations

import uuid


def register_payload(
    *,
    email: str | None = None,
    number: str | None = None,
    code_number: str | None = None,
) -> dict:
    """Build a payload that passes ``UserCreate`` validation."""
    suffix = uuid.uuid4().hex[:10]
    code = code_number if code_number is not None else f"{uuid.uuid4().int % 10_000_000_000:010d}"
    return {
        "name": "Test",
        "last": "User",
        "age": 25,
        "birthdate": "1999-05-01",
        "code_number": code,
        "country": "US",
        "number": number if number is not None else f"+1555{suffix[:8]}",
        "gender": "m",
        "email": email if email is not None else f"reg_{suffix}@test.example.com",
        "password": "TestPassword1!",
        "height": 175,
        "weight": 70,
        "target_weight": 68,
        "fitness_goal": "muscle",
        "fitness_level": "intermediate",
        "training_preferences": {
            "preferred_muscle_groups": ["chest"],
            "equipment": [],
            "available_days": ["monday", "wednesday"],
            "workout_types": ["strength"],
        },
    }
