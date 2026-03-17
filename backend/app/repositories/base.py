from __future__ import annotations

import uuid
from typing import Any, Generic, Optional, TypeVar, cast

from sqlalchemy import select

from app.extensions import db
from app.models.base import BaseModel

T = TypeVar("T", bound=BaseModel)


class BaseRepository(Generic[T]):
    def __init__(self, model: type[T]) -> None:
        self.model = model

    def get_by_id(self, record_id: uuid.UUID) -> Optional[T]:
        return cast(Optional[T], db.session.get(self.model, record_id))

    def get_all(self, **filters: Any) -> list[T]:
        stmt = select(self.model).filter_by(**filters)
        return list(db.session.scalars(stmt).all())

    def create(self, **kwargs: Any) -> T:
        instance = self.model(**kwargs)
        db.session.add(instance)
        db.session.flush()
        return instance

    def update(self, record_id: uuid.UUID, **kwargs: Any) -> Optional[T]:
        instance = self.get_by_id(record_id)
        if not instance:
            return None
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        db.session.flush()
        return instance

    def delete(self, record_id: uuid.UUID) -> bool:
        instance = self.get_by_id(record_id)
        if not instance:
            return False
        db.session.delete(instance)
        db.session.flush()
        return True

    def flush(self) -> None:
        db.session.flush()
