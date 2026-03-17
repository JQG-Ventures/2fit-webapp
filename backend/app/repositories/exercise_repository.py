from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select

from app.extensions import db
from app.models.exercise import Exercise
from app.repositories.base import BaseRepository


class ExerciseRepository(BaseRepository[Exercise]):
    def __init__(self) -> None:
        super().__init__(Exercise)

    def get_active(self) -> list[Exercise]:
        stmt = select(Exercise).where(Exercise.is_active.is_(True))
        return list(db.session.scalars(stmt).all())

    def get_by_ids(self, ids: list[uuid.UUID]) -> list[Exercise]:
        if not ids:
            return []
        stmt = select(Exercise).where(Exercise.id.in_(ids))
        return list(db.session.scalars(stmt).all())

    def get_similar(self, exercise_id: uuid.UUID) -> list[Exercise]:
        exercise = self.get_by_id(exercise_id)
        if not exercise:
            return []
        stmt = (
            select(Exercise)
            .where(
                Exercise.is_active.is_(True),
                Exercise.id != exercise_id,
                Exercise.muscle_group.overlap(exercise.muscle_group),
            )
            .limit(10)
        )
        return list(db.session.scalars(stmt).all())

    def soft_delete(self, exercise_id: uuid.UUID) -> bool:
        exercise = self.get_by_id(exercise_id)
        if not exercise:
            return False
        exercise.is_active = False
        db.session.flush()
        return True

    def bulk_create(self, exercises_data: list[dict[str, Any]]) -> list[Exercise]:
        exercises = [Exercise(**data) for data in exercises_data]
        db.session.add_all(exercises)
        db.session.flush()
        return exercises
