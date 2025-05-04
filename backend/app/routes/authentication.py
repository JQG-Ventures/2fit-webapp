"""Defines auth endpoints for user registration, login, token refresh, and Google login."""

from flask import Blueprint, request
from flask_restx import Api, Resource, fields
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    decode_token,
)
from marshmallow import ValidationError
from werkzeug.security import generate_password_hash
import logging

from app.models.user import User
from app.Schemas.UserSchema import user_schema
from app.services.workout_plan_service import WorkoutPlanGenerator
import app.settings as s
from app.utils.users import validate_user_by_credentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


auth_bp = Blueprint("auth_bp", __name__)
api = Api(auth_bp, doc="/docs")
logger = logging.getLogger(__name__)

notifications_model = api.model(
    "Notifications",
    {
        "general": fields.Boolean(default=True, description="General notifications"),
        "updates": fields.Boolean(default=True, description="Updates notifications"),
        "services": fields.Boolean(default=True, description="Services notifications"),
        "tips": fields.Boolean(default=True, description="Tips notifications"),
        "bot": fields.Boolean(default=True, description="Bot notifications"),
        "reminders": fields.Boolean(default=True, description="Reminders notifications"),
    },
)

settings_model = api.model(
    "Settings",
    {
        "notifications": fields.Nested(notifications_model, required=True),
        "nutrition_enabled": fields.Boolean(
            default=False, description="Nutrition tracking enabled"
        ),
        "language_preference": fields.String(default="es", description="Language preference"),
    },
)

automation_data_model = api.model(
    "AutomationData",
    {
        "profile_complete": fields.Boolean(default=False, description="Is profile complete"),
        "message_sent": fields.Boolean(default=False, description="Message sent"),
        "greetings_sent": fields.Boolean(default=False, description="Greetings sent"),
        "created_by_bot": fields.Boolean(default=False, description="Created by bot"),
        "last_motivational_message": fields.String(description="Last motivational message"),
    },
)

training_preferences_model = api.model(
    "TrainingPreferences",
    {
        "preferred_muscle_groups": fields.List(
            fields.String, description="Preferred muscle groups"
        ),
        "equipment": fields.List(fields.String, description="Equipment"),
        "available_days": fields.List(
            fields.String,
            required=True,
            description="Available days",
            enum=[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
            ],
        ),
        "workout_types": fields.List(
            fields.String,
            required=True,
            description="Workout types",
            enum=["cardio", "strength", "yoga", "strength", "dance"],
        ),
        "saved_workouts": fields.List(fields.String, description="Saved workouts"),
    },
)

preferences_model = api.model(
    "Preferences",
    {
        "water_consumption": fields.Float(description="Water consumption", required=False),
        "dietary_restrictions": fields.List(fields.String, description="Dietary restrictions"),
        "dietary_goals": fields.String(description="Dietary goals"),
        "preferences": fields.List(fields.String, description="Other preferences"),
    },
)

user_registration_model = api.model(
    "UserRegistration",
    {
        "name": fields.String(required=True, description="First name"),
        "last": fields.String(required=True, description="Last name"),
        "age": fields.Integer(required=True, description="Age"),
        "birthdate": fields.String(required=True, description="Birthdate in YYYY-MM-DD format"),
        "country": fields.String(required=True, description="Country"),
        "number": fields.String(required=True, description="Phone number"),
        "gender": fields.String(required=True, description="Gender", enum=["m", "f"]),
        "email": fields.String(required=True, description="Email address"),
        "password": fields.String(required=True, description="Password"),
        "roles": fields.List(
            fields.String,
            default=["user"],
            description="User roles",
            enum=["user", "admin"],
        ),
        "auth_provider": fields.String(
            default="default",
            description="Which authentication method",
            enum=["default", "google", "meta", "apple"],
        ),
        "height": fields.Integer(required=True, description="Height in cm"),
        "weight": fields.Integer(required=True, description="Weight in kg"),
        "target_weight": fields.Integer(required=True, description="Target weight in kg"),
        "fitness_goal": fields.String(
            required=True,
            description="Fitness goal",
            enum=["weight", "keep", "strength", "muscle"],
        ),
        "fitness_level": fields.String(
            required=True,
            description="Fitness level",
            enum=["beginner", "irregular", "intermediate", "advanced"],
        ),
        "training_preferences": fields.Nested(training_preferences_model, required=True),
        "preferences": fields.Nested(preferences_model, required=True),
        "settings": fields.Nested(settings_model, required=True),
        "automation_data": fields.Nested(automation_data_model, required=True),
    },
)

login_model = api.model(
    "Login",
    {
        "email": fields.String(description="Email address"),
        "phone": fields.String(description="Phone number"),
        "password": fields.String(required=True, description="Password"),
    },
)

google_login_model = api.model(
    "Google Login", {"email": fields.String(description="Email address")}
)


@api.route("/register")
class RegisterResource(Resource):
    """Handles user registration."""

    @api.expect(user_registration_model)
    @api.doc("register_user")
    @api.response(200, "User was registered successfully!")
    @api.response(400, "User already registered!")
    @api.response(400, "Validation Error")
    @api.response(500, "Internal Server Error")
    def post(self):
        """Register a new user."""
        data = request.json
        try:
            number = f"{data['code_number']}{data['number']}"

            if not User.get_user_by_number(number):
                if data["auth_provider"] == "default":
                    data["password_hash"] = generate_password_hash(data["password"])
                    del data["password"]
                else:
                    data["password_hash"] = ""

                validated_data = user_schema.load(data)
                user_id = User.create_new_user(validated_data)
                validated_data["_id"] = user_id
                WorkoutPlanGenerator.generate_workout_plan(validated_data)

                return {
                    "status": "success",
                    "message": "User was registered successfully!",
                }, 200
            return {
                "status": "error",
                "message": "User already registered!",
            }, 400
        except ValidationError as err:
            return {"status": "error", "message": err.messages}, 400
        except Exception as e:
            logger.exception(f"There was a problem handling the user registration, error: {e}")
            return {
                "status": "error",
                "message": "Could not handle the user registration",
            }, 500


@api.route("/login")
class LoginResource(Resource):
    """Handles user login and JWT token generation."""

    @api.expect(login_model)
    @api.doc("login_user")
    @api.response(200, "Login successful")
    @api.response(400, "Missing credentials")
    @api.response(401, "Invalid credentials")
    @api.response(500, "Internal Server Error")
    def post(self):
        """Authenticate a user and return access tokens."""
        try:
            data = request.json
            email_or_phone = data.get("email") or data.get("phone")
            password = data.get("password")

            if not email_or_phone or not password:
                return {
                    "status": "error",
                    "message": "Missing credentials",
                }, 400

            if "@" in email_or_phone:
                user = User.get_user_by_email(email_or_phone)
            else:
                user = User.get_user_by_number(email_or_phone)

            if not user:
                return {
                    "status": "error",
                    "message": "Invalid credentials",
                }, 404

            if validate_user_by_credentials(user, password):
                access_token = create_access_token(identity=user["_id"])
                refresh_token = create_refresh_token(identity=user["_id"])
                decoded_access_token = decode_token(access_token)
                expiration_timestamp = decoded_access_token["exp"]

                return {
                    "status": "success",
                    "message": {
                        "access_token": access_token,
                        "expires_at": expiration_timestamp,
                        "refresh_token": refresh_token,
                        "user_id": user["_id"],
                        "name": f"{user.get('name')} {user.get('last', '')}",
                    },
                }, 200
            else:
                return {
                    "status": "error",
                    "message": "Invalid credentials",
                }, 401

        except Exception as e:
            logger.exception(f"There was a problem handling the user login, error: {e}")
            return {
                "status": "error",
                "message": "Could not handle the user login",
            }, 500


@api.route("/refresh-token")
class RefreshTokenResource(Resource):
    """Handles refreshing access tokens using a valid refresh token."""

    @api.doc("refresh_token")
    @api.response(200, "Token refreshed")
    @api.response(500, "Internal Server Error")
    @jwt_required(refresh=True)
    def post(self):
        """Refresh an access token."""
        try:
            user_id = get_jwt_identity()
            access_token = create_access_token(identity=user_id)
            decoded_access_token = decode_token(access_token)
            expiration_timestamp = decoded_access_token["exp"]

            return {
                "status": "success",
                "message": {
                    "access_token": access_token,
                    "expires_at": expiration_timestamp,
                },
            }, 200
        except Exception as e:
            logger.exception(f"There was a problem refreshing the token, error: {e}")
            return {
                "status": "error",
                "message": "Could not refresh the token",
            }, 500


@api.route("/google")
class GoogleAuthResource(Resource):
    """Handles initial Google auth to check if user already exists."""

    @api.doc("google_auth")
    @api.response(200, "Login successful")
    @api.response(400, "Missing profile data")
    @api.response(500, "Internal Server Error")
    def post(self):
        """Authenticate a user using their Google profile."""
        try:
            data = request.json
            email = data.get("email")
            name = data.get("name")

            if not email or not name:
                return {
                    "status": "error",
                    "message": "Missing profile data",
                }, 400

            user = User.get_user_by_email(email)

            if not user:
                return {
                    "status": "success",
                    "message": {"email": email, "name": name},
                }, 200

            return {
                "status": "error",
                "message": "User already registered",
            }, 400

        except Exception as e:
            logger.exception(f"Error in Google auth: {e}")
            return {
                "status": "error",
                "message": "Could not handle Google login",
            }, 500


@api.route("/google-login")
class GoogleLoginResource(Resource):
    """Handles Google login using an ID token."""

    def post(self):
        """Login an existing Google-registered user using a Google ID token."""
        data = request.json
        google_id_token = data.get("id_token")
        if not google_id_token:
            return {
                "status": "error",
                "message": "Missing Google ID token",
            }, 400
        try:
            decoded_token = id_token.verify_oauth2_token(
                google_id_token, google_requests.Request(), s.GOOGLE_CLIENT_ID
            )

            email = decoded_token.get("email")

            if not email:
                return {
                    "status": "error",
                    "message": "No email found in Google token",
                }, 400

            user = User.get_user_by_email(email)

            if not user:
                return {"status": "error", "message": "User not found"}, 404

            if user.get("auth_provider") != "google":
                return {
                    "status": "error",
                    "message": "User is not registered with Google",
                }, 401

            access_token = create_access_token(identity=user["_id"])
            refresh_token = create_refresh_token(identity=user["_id"])
            exp_timestamp = decode_token(access_token)["exp"]

            return {
                "status": "success",
                "message": {
                    "access_token": access_token,
                    "expires_at": exp_timestamp,
                    "refresh_token": refresh_token,
                    "user_id": user["_id"],
                    "name": f"{user.get('name')} {user.get('last', '')}",
                },
            }, 200
        except ValueError:
            return {
                "status": "error",
                "message": "Invalid Google ID token",
            }, 400
        except Exception as e:
            return {
                "status": "error",
                "message": f"Could not handle Google login, {e}",
            }, 500
