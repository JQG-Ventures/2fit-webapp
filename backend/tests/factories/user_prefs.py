from __future__ import annotations

import factory

from app.models.user import UserAutomationData, UserPreference, UserSettings
from tests.factories.base import BaseFactory
from tests.factories.user import UserFactory


class UserPreferenceFactory(BaseFactory):
    class Meta:
        model = UserPreference

    user = factory.SubFactory(UserFactory)
    water_consumption = 2.0
    dietary_restrictions = factory.LazyFunction(list)
    dietary_goals = None
    preferences = factory.LazyFunction(list)


class UserSettingsFactory(BaseFactory):
    class Meta:
        model = UserSettings

    user = factory.SubFactory(UserFactory)


class UserAutomationDataFactory(BaseFactory):
    class Meta:
        model = UserAutomationData

    user = factory.SubFactory(UserFactory)
    profile_complete = False
    message_sent = False
    greetings_sent = False
    created_by_bot = False
    last_motivational_message = None
