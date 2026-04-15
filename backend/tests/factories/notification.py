from __future__ import annotations

import factory

from app.models.notification import NotificationDevice
from tests.factories.base import BaseFactory
from tests.factories.user import UserFactory


class NotificationDeviceFactory(BaseFactory):
    class Meta:
        model = NotificationDevice

    user = factory.SubFactory(UserFactory)
    player_id = factory.Sequence(lambda n: f"player-{n}")
    platform = "web"
    last_used = None
