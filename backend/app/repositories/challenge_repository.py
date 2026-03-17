from __future__ import annotations

import uuid
from typing import Any, Optional, cast

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.challenge import Challenge, ChallengeDay, ChallengeDayExercise
from app.repositories.base import BaseRepository


class ChallengeRepository(BaseRepository[Challenge]):
    def __init__(self) -> None:
        super().__init__(Challenge)

    def get_active(self) -> list[Challenge]:
        stmt = select(Challenge).where(Challenge.is_active.is_(True))
        return list(db.session.scalars(stmt).all())

    def get_with_schedule(self, challenge_id: uuid.UUID) -> Optional[Challenge]:
        stmt = (
            select(Challenge)
            .where(Challenge.id == challenge_id)
            .options(
                joinedload(Challenge.challenge_days)
                .joinedload(ChallengeDay.exercises)
                .joinedload(ChallengeDayExercise.exercise)
            )
        )
        return cast(Optional[Challenge], db.session.scalars(stmt).unique().first())

    def soft_delete(self, challenge_id: uuid.UUID) -> bool:
        challenge = self.get_by_id(challenge_id)
        if not challenge:
            return False
        challenge.is_active = False
        db.session.flush()
        return True

    def replace_schedule(self, challenge_id: uuid.UUID, days_data: list[dict[str, Any]]) -> None:
        challenge = self.get_with_schedule(challenge_id)
        if not challenge:
            return
        for day in challenge.challenge_days:
            for cde in day.exercises:
                db.session.delete(cde)
            db.session.delete(day)
        db.session.flush()

        for day_data in days_data:
            exercises_data = cast(list[dict[str, Any]], day_data.pop("exercises", []))
            day = ChallengeDay(challenge_id=challenge_id, **day_data)
            db.session.add(day)
            db.session.flush()
            for ex_data in exercises_data:
                ex_id = str(ex_data.pop("exercise_id"))
                cde = ChallengeDayExercise(
                    challenge_day_id=day.id,
                    exercise_id=uuid.UUID(ex_id),
                    **ex_data,
                )
                db.session.add(cde)
        db.session.flush()

    def create_full_challenge(
        self, challenge_data: dict[str, Any], days_data: list[dict[str, Any]]
    ) -> Challenge:
        challenge = Challenge(**challenge_data)
        db.session.add(challenge)
        db.session.flush()

        for day_data in days_data:
            exercises_data = cast(list[dict[str, Any]], day_data.pop("exercises", []))
            day = ChallengeDay(challenge_id=challenge.id, **day_data)
            db.session.add(day)
            db.session.flush()

            for ex_data in exercises_data:
                ex_id = str(ex_data.pop("exercise_id"))
                cde = ChallengeDayExercise(
                    challenge_day_id=day.id,
                    exercise_id=uuid.UUID(ex_id),
                    **ex_data,
                )
                db.session.add(cde)

        db.session.flush()
        return challenge
