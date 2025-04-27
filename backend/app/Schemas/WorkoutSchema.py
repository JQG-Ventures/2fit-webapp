from marshmallow import Schema, fields, validates_schema, ValidationError
from datetime import datetime
from typing import Any


class WorkoutExerciseSchema(Schema):
    """Schema for exercises within a workout."""

    exercise_id = fields.String(required=True)
    sets = fields.Integer(required=True)
    reps = fields.Integer(required=True)
    rest_seconds = fields.Integer(required=True)


class WorkoutDaySchema(Schema):
    """Schema for a workout day, which can be day-based or sequence-based."""

    day_of_week = fields.String(
        validate=lambda x: x
        in [
            "",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ]
    )
    sequence_day = fields.Integer()
    exercises = fields.List(fields.Nested(WorkoutExerciseSchema), required=True)

    @validates_schema
    def validate_day(self, data: dict[str, Any], **kwargs: Any) -> None:
        if not data.get("day_of_week") and not data.get("sequence_day"):
            raise ValidationError("Either day_of_week or sequence_day must be provided.")


class WorkoutPlanSchema(Schema):
    """Schema for a personalized, public, or challenge workout plan."""

    _id = fields.String(attribute="_id")
    name = fields.String(required=True)
    description = fields.String()
    plan_type = fields.String(
        required=True,
        validate=lambda x: x in ["library", "paid", "personalized", "challenge"],
    )
    duration_weeks = fields.Integer()
    price = fields.Float()  # Optional for paid plans
    image_url = fields.String()
    video_url = fields.String()
    workout_schedule = fields.List(fields.Nested(WorkoutDaySchema), required=True)
    level = fields.String(
        default="beginner",
        validate=lambda x: x in ["beginner", "intermediate", "advanced"],
    )
    created_at = fields.String(default=datetime.now)
    updated_at = fields.String(default=datetime.now)
    is_active = fields.Boolean(default=True)


# class ChallengeSchema(Schema):
#     """Schema for defining a workout challenge (e.g., 1 Month to Get Your Gains)."""
#     _id = fields.String(attribute="_id")
#     name = fields.String(required=True)
#     description = fields.String()
#     duration_days = fields.Integer(required=True)  # Duration of the challenge in days
#     participants = fields.List(fields.String(), default=[])  # List of user_ids of participants
#     workout_schedule = fields.List(
#       fields.Nested(WorkoutDaySchema), required=True)  # Daily workout schedule for the challenge
#     created_at = fields.DateTime(default=datetime.utcnow)
#     updated_at = fields.DateTime(default=datetime.utcnow)


workout_plan_schema = WorkoutPlanSchema()
workout_plans_schema = WorkoutPlanSchema(many=True)
# challenge_schema = ChallengeSchema()
# challenges_schema = ChallengeSchema(many=True)
