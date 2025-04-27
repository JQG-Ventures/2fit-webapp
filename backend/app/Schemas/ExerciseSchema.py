from marshmallow import Schema, fields


class ExerciseSchema(Schema):
    """Schema for Exercise validation."""

    _id = fields.String(attribute="_id", dump_only=True)
    name = fields.String(required=True)
    description = fields.String()
    category = fields.String(
        required=True,
        validate=lambda x: x in ["strength", "yoga", "dance", "cardio"],
    )
    image_url = fields.String()
    video_url = fields.String()
    muscle_group = fields.List(
        fields.String(), required=True
    )  # TODO: Add proper list of muscle_group validation
    difficulty = fields.String(
        default="beginner",
        validate=lambda x: x in ["beginner", "intermediate", "advanced"],
    )
    # TODO: Add proper list of equipment validation
    equipment = fields.List(fields.String())
    instructions = fields.List(fields.String())
    contradictions = fields.List(fields.String())
    is_active = fields.Boolean(default=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


exercise_schema = ExerciseSchema()
exercises_schema = ExerciseSchema(many=True)
