"""Valid JSON bodies for ``/api/challenges/challenges`` (``ChallengeCreate``)."""

from __future__ import annotations


def challenge_create_dict(exercise_id: str, *, name_suffix: str = "") -> dict:
    return {
        "name": f"Lote4 Challenge {name_suffix}".strip(),
        "description": "Integration test challenge",
        "plan_type": "challenge",
        "duration_days": 7,
        "price": 0.0,
        "image_url": "",
        "video_url": "",
        "intensity": True,
        "equipment": ["dumbbells"],
        "category": ["strength"],
        "level": "beginner",
        "is_active": True,
        "workout_schedule": [
            {
                "sequence_day": 1,
                "name": "Day 1",
                "is_rest": False,
                "exercises": [
                    {
                        "exercise_id": exercise_id,
                        "sets": 3,
                        "reps": 10,
                        "rest_seconds": 60,
                    }
                ],
            }
        ],
    }
