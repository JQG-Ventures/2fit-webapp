"""Schemas for user data, preferences, workouts, and automation tracking."""

from marshmallow import Schema, fields, validate
from datetime import datetime


class TrainingPreferencesSchema(Schema):
    """Schema for user training preferences."""

    preferred_muscle_groups = fields.List(fields.String(), missing=[])
    equipment = fields.List(fields.String(), missing=[])
    available_days = fields.List(
        fields.String(
            validate=lambda x: x
            in [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
            ]
        ),
        required=True,
    )
    workout_types = fields.List(
        fields.String(validate=lambda x: x in ["cardio", "strength", "yoga", "dance"]),
        required=True,
    )
    saved_workouts = fields.List(fields.String(), missing=[])


class PreferencesSchema(Schema):
    """Schema for user preferences."""

    water_consumption = fields.Float(allow_none=True, missing=None)
    dietary_restrictions = fields.List(fields.String(), missing=[])
    dietary_goals = fields.String(allow_none=True, missing=None)
    preferences = fields.List(fields.String(), missing=[])


class SecuritySettingsSchema(Schema):
    """Schema for user notifications."""

    general = fields.Boolean(missing=True)
    updates = fields.Boolean(missing=True)
    services = fields.Boolean(missing=True)
    tips = fields.Boolean(missing=True)
    bot = fields.Boolean(missing=True)
    reminders = fields.Boolean(missing=True)


class NotificationsSchema(Schema):
    """Schema for user security settings."""

    face_id = fields.Boolean(missing=True)
    remember_me = fields.Boolean(missing=True)
    touch_id = fields.Boolean(missing=True)


class SettingsSchema(Schema):
    """Schema for user settings."""

    notifications = fields.Nested(
        NotificationsSchema, missing=lambda: NotificationsSchema().load({})
    )
    nutrition_enabled = fields.Boolean(missing=False)
    language_preference = fields.String(missing="es")
    security_settings = fields.Nested(
        SecuritySettingsSchema, missing=lambda: SecuritySettingsSchema().load({})
    )


class ExecutedExerciseSchema(Schema):
    """Schema for tracking a completed exercise."""

    exercise_id = fields.String(required=True)
    sets_completed = fields.Integer(required=True)
    reps_completed = fields.List(fields.Integer(), required=True)
    duration_seconds = fields.Integer(required=True)
    calories_burned = fields.Float(required=True)
    is_completed = fields.Boolean(default=True)


class ExecutedWorkoutSchema(Schema):
    """Schema for tracking a workout that has been completed."""

    workout_id = fields.String(required=True)
    date = fields.String(required=True)
    duration_seconds = fields.Integer(required=True)
    calories_burned = fields.Float(required=True)
    exercises = fields.List(fields.Nested(ExecutedExerciseSchema), required=True)
    day_of_week = fields.String()
    sequence_day = fields.String()
    was_skipped = fields.Boolean(missing=False)


class DayProgressSchema(Schema):
    """Schema to track progress for a workout day."""

    week_number = fields.Integer()
    day_of_week = fields.String()
    sequence_day = fields.Integer()
    is_completed = fields.Boolean(default=False)
    exercises = fields.List(fields.Nested(ExecutedExerciseSchema), missing=[])


class ActiveWorkoutPlanSchema(Schema):
    """Schema for tracking active workout plans for a user."""

    workout_plan_id = fields.String(required=True)
    workout_name = fields.String(required=True)
    # Plan type: 'library', 'paid', 'personalized', 'challenge'
    plan_type = fields.String(required=True)
    start_date = fields.String(required=True)
    end_date = fields.String(allow_none=True)
    is_completed = fields.Boolean(missing=False)
    progress = fields.Float(missing=0.0)
    last_completed_workout = fields.Nested(ExecutedWorkoutSchema, allow_none=True, missing=None)
    progress_details = fields.List(fields.Nested(DayProgressSchema), missing=[])
    in_progress_workout = fields.Nested(ExecutedWorkoutSchema, allow_none=True, missing=None)


class AutomationDataSchema(Schema):
    """Schema for user automation data."""

    profile_complete = fields.Boolean(missing=False)
    message_sent = fields.Boolean(missing=False)
    greetings_sent = fields.Boolean(missing=False)
    created_by_bot = fields.Boolean(missing=False)
    last_motivational_message = fields.String(allow_none=True, missing=None)


class WorkoutHistorySchema(Schema):
    """Schema to track the history of completed workouts."""

    completed_workouts = fields.List(fields.Nested(ExecutedWorkoutSchema), missing=[])
    active_plans = fields.List(fields.Nested(ActiveWorkoutPlanSchema), missing=[])


class UserSchema(Schema):
    """Schema for User validation."""

    _id = fields.String(attribute="_id")
    name = fields.String(required=True)
    last = fields.String(required=True)
    age = fields.Integer(required=True)
    birthdate = fields.String(required=True)
    code_number = fields.String(required=True)
    country = fields.String(required=True)
    number = fields.String(required=True)
    gender = fields.String(required=True, validate=validate.OneOf(["m", "f"]))
    email = fields.Email(required=True)
    password_hash = fields.String(required=True)
    roles = fields.List(
        fields.String(),
        validate=lambda x: x in ["user", "admin"],
        missing=["user"],
    )
    created_at = fields.String(default=datetime.now)
    updated_at = fields.String(default=datetime.now)
    height = fields.Integer(required=True)
    weight = fields.Integer(required=True)
    target_weight = fields.Integer(required=True)
    profile_image = fields.String(missing="")
    auth_provider = fields.String(
        missing="default",
        validate=validate.OneOf(["default", "google", "meta", "apple"]),
    )
    fitness_goal = fields.String(
        required=True,
        validate=validate.OneOf(["weight", "keep", "strength", "muscle"]),
    )
    fitness_level = fields.String(
        required=True,
        validate=validate.OneOf(["beginner", "irregular", "intermediate", "advanced"]),
    )
    training_preferences = fields.Nested(TrainingPreferencesSchema, required=True)
    preferences = fields.Nested(PreferencesSchema, missing=lambda: PreferencesSchema().load({}))
    settings = fields.Nested(SettingsSchema, missing=lambda: SettingsSchema().load({}))
    automation_data = fields.Nested(
        AutomationDataSchema, missing=lambda: AutomationDataSchema().load({})
    )
    workout_history = fields.Nested(
        WorkoutHistorySchema, missing=lambda: WorkoutHistorySchema().load({})
    )


user_schema = UserSchema()
users_schema = UserSchema(many=True)
executedWorkoutSchema = ExecutedWorkoutSchema()
