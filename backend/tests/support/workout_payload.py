"""Valid ``WorkoutPlanCreate``-style dicts for workout API tests."""

from __future__ import annotations


def workout_plan_create_dict(exercise_id: str) -> dict:
    return {
        "name": "Test Plan",
        "description": "Test description",
        "plan_type": "library",
        "level": "beginner",
        "workout_schedule": [
            {
                "sequence_day": 1,
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


def exercise_create_dict(*, name_suffix: str = "x") -> dict:
    return {
        "name": f"Exercise {name_suffix}",
        "description": "d",
        "category": "strength",
        "muscle_group": ["chest"],
        "difficulty": "beginner",
        "equipment": [],
        "instructions": ["a"],
        "contradictions": [],
        "is_active": True,
    }
