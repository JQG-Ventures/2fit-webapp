"""Schema definitions for conversation and message serialization."""

from marshmallow import Schema, fields


class MessageSchema(Schema):
    """Schema representing a single message in a conversation."""

    timestamp = fields.Str()
    role = fields.Str()
    content = fields.Str()


class ConversationSchema(Schema):
    """Schema representing a conversation, including a list of messages."""

    _id = fields.String(attribute="_id")
    conversation_id = fields.Str()
    messages = fields.List(fields.Nested(MessageSchema))
    user_id = fields.Str()


conversation_schema = ConversationSchema()
conversations_schema = ConversationSchema(many=True)
