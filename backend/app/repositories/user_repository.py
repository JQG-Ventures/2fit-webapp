from __future__ import annotations

import uuid
from typing import Any, Optional, cast

from sqlalchemy import select

from app.extensions import db
from app.models.user import User, UserAutomationData, UserPreference, UserSettings
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self) -> None:
        super().__init__(User)

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return cast(Optional[User], db.session.scalars(stmt).first())

    def get_by_number(self, number: str) -> Optional[User]:
        stmt = select(User).where(User.number == number)
        return cast(Optional[User], db.session.scalars(stmt).first())

    def create_with_related(
        self,
        user_data: dict[str, Any],
        preference_data: dict[str, Any],
        settings_data: dict[str, Any],
        automation_data: dict[str, Any],
    ) -> User:
        user = User(**user_data)
        db.session.add(user)
        db.session.flush()

        pref = UserPreference(user_id=user.id, **preference_data)
        settings = UserSettings(user_id=user.id, **settings_data)
        automation = UserAutomationData(user_id=user.id, **automation_data)
        db.session.add_all([pref, settings, automation])
        db.session.flush()

        return user

    def update_profile(self, user_id: uuid.UUID, data: dict[str, Any]) -> Optional[User]:
        user = self.get_by_id(user_id)
        if not user:
            return None
        for key, value in data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        db.session.flush()
        return user
