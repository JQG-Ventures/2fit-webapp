from __future__ import annotations

import factory

from app.models.conversation import Conversation, Message
from tests.factories.base import BaseFactory
from tests.factories.user import UserFactory


class ConversationFactory(BaseFactory):
    class Meta:
        model = Conversation

    user = factory.SubFactory(UserFactory)


class MessageFactory(BaseFactory):
    class Meta:
        model = Message

    conversation = factory.SubFactory(ConversationFactory)
    role = "user"
    content = "Hello"
