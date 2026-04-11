import uuid
from typing import Any, cast

from sqlalchemy import select

from app.extensions import db
from app.models.base import BaseModel


class BaseRepository[T: BaseModel]:
    def __init__(self, model: type[T]) -> None:
        self.model = model

    def get_by_id(self, record_id: uuid.UUID) -> T | None:
        return cast(T | None, db.session.get(self.model, record_id))

    def get_all(self, **filters: Any) -> list[T]:
        stmt = select(self.model).filter_by(**filters)
        return list(db.session.scalars(stmt).all())

    def create(self, **kwargs: Any) -> T:
        instance = self.model(**kwargs)
        db.session.add(instance)
        db.session.flush()
        return instance

    def update(self, record_id: uuid.UUID, **kwargs: Any) -> T | None:
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
