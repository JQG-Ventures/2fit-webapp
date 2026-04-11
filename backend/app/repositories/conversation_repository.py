import uuid
from typing import cast

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.conversation import Conversation, Message


class ConversationRepository:
    def get_by_user(self, user_id: uuid.UUID) -> Conversation | None:
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .options(joinedload(Conversation.messages))
        )
        return cast(Conversation | None, db.session.scalars(stmt).unique().first())

    def get_or_create(self, user_id: uuid.UUID) -> Conversation:
        conversation = self.get_by_user(user_id)
        if conversation:
            return conversation
        conversation = Conversation(user_id=user_id)
        db.session.add(conversation)
        db.session.flush()
        return conversation

    def add_message(self, conversation_id: uuid.UUID, role: str, content: str) -> Message:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )
        db.session.add(message)
        db.session.flush()
        return message
