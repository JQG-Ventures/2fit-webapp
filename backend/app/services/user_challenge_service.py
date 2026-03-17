from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any

from app.extensions import db
from app.repositories.progress_repository import (
    ActiveChallengeRepository,
    CompletedChallengeDayRepository,
)

logger = logging.getLogger(__name__)
Payload = dict[str, Any]


class UserChallengeService:
    _active_repo = ActiveChallengeRepository()
    _completed_repo = CompletedChallengeDayRepository()

    @staticmethod
    def save_challenge_progress(user_id: str, challenge_id: str, progress_data: Payload) -> None:
        try:
            user_uuid = uuid.UUID(user_id)
            challenge_uuid = uuid.UUID(challenge_id)
            repo = ActiveChallengeRepository()

            active = repo.get_for_user(user_uuid, challenge_uuid)

            incoming_date_str = progress_data.get("date", "")
            incoming_date = (
                datetime.fromisoformat(incoming_date_str) if incoming_date_str else datetime.now()
            )

            if active:
                same_day = active.sequence_day == progress_data["sequence_day"]
                same_date = active.date.date() == incoming_date.date() if active.date else False
                if same_day and same_date:
                    existing_map = {str(ex.exercise_id): ex for ex in active.exercises}
                    for ex_data in progress_data.get("exercises", []):
                        ex_id = ex_data["exercise_id"]
                        if ex_id in existing_map:
                            ex = existing_map[ex_id]
                            ex.sets_completed = max(
                                ex.sets_completed, ex_data.get("sets_completed", 0)
                            )
                            ex.reps_completed = ex.reps_completed + ex_data.get(
                                "reps_completed", []
                            )
                            ex.duration_seconds += ex_data.get("duration_seconds", 0)
                            ex.calories_burned += ex_data.get("calories_burned", 0)
                            ex.is_completed = ex.is_completed or ex_data.get("is_completed", False)
                        else:
                            repo.add_exercise(
                                active.id,
                                uuid.UUID(ex_id),
                                sets_completed=ex_data.get("sets_completed", 0),
                                reps_completed=ex_data.get("reps_completed", []),
                                duration_seconds=ex_data.get("duration_seconds", 0),
                                calories_burned=ex_data.get("calories_burned", 0),
                                is_completed=ex_data.get("is_completed", False),
                            )
                else:
                    active.date = incoming_date
                    active.sequence_day = progress_data["sequence_day"]
                    for ex in active.exercises:
                        db.session.delete(ex)
                    db.session.flush()
                    for ex_data in progress_data.get("exercises", []):
                        repo.add_exercise(
                            active.id,
                            uuid.UUID(ex_data["exercise_id"]),
                            sets_completed=ex_data.get("sets_completed", 0),
                            reps_completed=ex_data.get("reps_completed", []),
                            duration_seconds=ex_data.get("duration_seconds", 0),
                            calories_burned=ex_data.get("calories_burned", 0),
                            is_completed=ex_data.get("is_completed", False),
                        )
            else:
                active = repo.create(
                    user_id=user_uuid,
                    challenge_id=challenge_uuid,
                    date=incoming_date,
                    sequence_day=progress_data["sequence_day"],
                )
                for ex_data in progress_data.get("exercises", []):
                    repo.add_exercise(
                        active.id,
                        uuid.UUID(ex_data["exercise_id"]),
                        sets_completed=ex_data.get("sets_completed", 0),
                        reps_completed=ex_data.get("reps_completed", []),
                        duration_seconds=ex_data.get("duration_seconds", 0),
                        calories_burned=ex_data.get("calories_burned", 0),
                        is_completed=ex_data.get("is_completed", False),
                    )

            db.session.flush()
        except Exception:
            raise

    @staticmethod
    def save_completed_challenge(user_id: str, completed_data: Payload) -> None:
        try:
            user_uuid = uuid.UUID(user_id)
            challenge_uuid = uuid.UUID(completed_data["challenge_id"])
            exercises = completed_data.get("exercises", [])

            total_duration = sum(ex.get("duration_seconds", 0) for ex in exercises)
            total_calories = sum(ex.get("calories_burned", 0) for ex in exercises)

            completed_repo = CompletedChallengeDayRepository()
            exercises_data = [
                {
                    "exercise_id": ex["exercise_id"],
                    "sets_completed": ex.get("sets_completed", 0),
                    "reps_completed": ex.get("reps_completed", []),
                    "duration_seconds": ex.get("duration_seconds", 0),
                    "calories_burned": ex.get("calories_burned", 0),
                    "is_completed": ex.get("is_completed", True),
                }
                for ex in exercises
            ]

            completed_repo.save(
                user_id=user_uuid,
                challenge_id=challenge_uuid,
                day_data={
                    "sequence_day": completed_data["sequence_day"],
                    "date": datetime.fromisoformat(completed_data["date"])
                    if isinstance(completed_data.get("date"), str)
                    else (completed_data.get("date") or datetime.now()),
                    "duration_seconds": total_duration,
                    "calories_burned": total_calories,
                    "was_skipped": False,
                },
                exercises_data=exercises_data,
            )

            active_repo = ActiveChallengeRepository()
            active = active_repo.get_for_user(user_uuid, challenge_uuid)
            if active:
                db.session.delete(active)

            db.session.flush()
        except Exception:
            raise
