from marshmallow import Schema, fields
from datetime import datetime


class ChallengeExerciseSchema(Schema):
    """Exercise inside a challenge day."""

    exercise_id = fields.String(required=True)
    sets = fields.Integer(required=True)
    reps = fields.Integer(required=True)
    rest_seconds = fields.Integer(required=True)


class ChallengeDaySchema(Schema):
    """A single day in the challenge schedule."""

    sequence_day = fields.Integer(required=True)
    name = fields.String(required=True)
    is_rest = fields.Boolean(required=True)
    exercises = fields.List(fields.Nested(ChallengeExerciseSchema), required=True)


class ChallengeSchema(Schema):
    """Schema for a challenge-based workout plan."""

    _id = fields.String(attribute="_id")
    name = fields.String(required=True)
    description = fields.String()
    plan_type = fields.String(required=True, validate=lambda x: x == "challenge")
    duration_days = fields.Integer(required=True)
    price = fields.Float(required=True)
    image_url = fields.String(required=True)
    video_url = fields.String()
    intensity = fields.Boolean(required=True)
    equipment = fields.List(fields.String(), allow_none=True)
    category = fields.List(fields.String(), required=True)
    workout_schedule = fields.List(fields.Nested(ChallengeDaySchema), required=True)
    level = fields.String(
        required=True, validate=lambda x: x in ["beginner", "intermediate", "advanced"]
    )
    is_active = fields.Boolean(default=True)
    created_at = fields.String(default=lambda: datetime.now().isoformat())
    updated_at = fields.String(default=lambda: datetime.now().isoformat())


challenge_schema = ChallengeSchema()
challenges_schema = ChallengeSchema(many=True)
