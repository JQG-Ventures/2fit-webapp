import logging
import uuid
from datetime import UTC, date, datetime

from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_jwt_identity,
    jwt_required,
)
from flask_restx import Api, Resource
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pydantic import ValidationError
from werkzeug.security import check_password_hash, generate_password_hash

import app.settings as s
from app.extensions import db
from app.models.notification import NotificationDevice
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, PlayerIDRequest
from app.schemas.user import UserCreate
from app.services.workout_plan_service import WorkoutPlanGenerator

auth_bp = Blueprint("auth_bp", __name__)
api = Api(auth_bp, doc="/docs")
logger = logging.getLogger(__name__)

ResponseBody = dict[str, object]
ResponseTuple = tuple[ResponseBody, int]


def _birthdate_str_to_date(value: str) -> date:
    s = value.strip()
    if "T" in s:
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return datetime.fromisoformat(s).date()
    return date.fromisoformat(s)


@api.route("/check-email")
class CheckEmailAvailabilityResource(Resource):
    def post(self) -> ResponseTuple:
        payload = request.get_json(silent=True) or {}
        email = payload.get("email", "").strip().lower()
        if not email:
            return {"status": "error", "message": "Email is required"}, 400
        try:
            repo = UserRepository()
            user = repo.get_by_email(email)
            return {"status": "success", "available": user is None}, 200
        except Exception as e:
            logger.exception("Error checking email availability: %s", e)
            return {"status": "error", "message": "Internal server error"}, 500


@api.route("/check-phone")
class CheckPhoneAvailabilityResource(Resource):
    def post(self) -> ResponseTuple:
        payload = request.get_json(silent=True) or {}
        number = payload.get("number", "").strip()
        if not number:
            return {"status": "error", "message": "Phone number is required"}, 400
        try:
            repo = UserRepository()
            user = repo.get_by_number(number)
            return {"status": "success", "available": user is None}, 200
        except Exception as e:
            logger.exception("Error checking phone availability: %s", e)
            return {"status": "error", "message": "Internal server error"}, 500


@api.route("/register")
class RegisterResource(Resource):
    def post(self) -> ResponseTuple:
        data = request.json
        try:
            schema = UserCreate(**data)

            repo = UserRepository()
            if repo.get_by_number(schema.number):
                return {"status": "error", "message": "User already registered!"}, 400
            if repo.get_by_email(schema.email):
                return {"status": "error", "message": "User already registered!"}, 400

            if schema.auth_provider == "default":
                if schema.password is None:
                    return {"status": "error", "message": "Password is required"}, 400
                password_hash = generate_password_hash(schema.password)
            else:
                password_hash = ""

            user_data = {
                "name": schema.name,
                "last": schema.last,
                "age": schema.age,
                "birthdate": _birthdate_str_to_date(schema.birthdate),
                "code_number": schema.code_number,
                "country": schema.country,
                "number": schema.number,
                "gender": schema.gender,
                "email": schema.email,
                "password_hash": password_hash,
                "roles": schema.roles,
                "height": schema.height,
                "weight": schema.weight,
                "target_weight": schema.target_weight,
                "profile_image": schema.profile_image,
                "auth_provider": schema.auth_provider,
                "fitness_goal": schema.fitness_goal,
                "fitness_level": schema.fitness_level,
                "preferred_muscle_groups": schema.training_preferences.preferred_muscle_groups,
                "equipment": schema.training_preferences.equipment,
                "available_days": schema.training_preferences.available_days,
                "workout_types": schema.training_preferences.workout_types,
            }

            prefs = schema.preferences
            preference_data = {
                "water_consumption": prefs.water_consumption,
                "dietary_restrictions": prefs.dietary_restrictions,
                "dietary_goals": prefs.dietary_goals,
                "preferences": prefs.preferences,
            }

            stg = schema.settings
            settings_data = {
                "notification_general": stg.notifications.general,
                "notification_updates": stg.notifications.updates,
                "notification_services": stg.notifications.services,
                "notification_tips": stg.notifications.tips,
                "notification_bot": stg.notifications.bot,
                "notification_reminders": stg.notifications.reminders,
                "nutrition_enabled": stg.nutrition_enabled,
                "language_preference": stg.language_preference,
                "security_face_id": stg.security_settings.face_id,
                "security_remember_me": stg.security_settings.remember_me,
                "security_touch_id": stg.security_settings.touch_id,
            }

            auto = schema.automation_data
            automation_data = {
                "profile_complete": auto.profile_complete,
                "message_sent": auto.message_sent,
                "greetings_sent": auto.greetings_sent,
                "created_by_bot": auto.created_by_bot,
                "last_motivational_message": auto.last_motivational_message,
            }

            user = repo.create_with_related(
                user_data, preference_data, settings_data, automation_data
            )

            WorkoutPlanGenerator.generate_workout_plan(
                str(user.id),
                {
                    "name": schema.name,
                    "fitness_level": schema.fitness_level,
                    "fitness_goal": schema.fitness_goal,
                    "available_days": schema.training_preferences.available_days,
                },
            )

            db.session.commit()
            return {"status": "success", "message": "User was registered successfully!"}, 200
        except ValidationError as err:
            return {"status": "error", "message": err.errors()}, 400
        except Exception as e:
            db.session.rollback()
            logger.exception("Registration error: %s", e)
            return {"status": "error", "message": "Could not handle the user registration"}, 500


@api.route("/login")
class LoginResource(Resource):
    def post(self) -> ResponseTuple:
        try:
            data = request.json
            schema = LoginRequest(**data)
            email_or_phone = schema.email or schema.phone

            if not email_or_phone:
                return {"status": "error", "message": "Missing credentials"}, 400

            repo = UserRepository()
            if "@" in email_or_phone:
                user = repo.get_by_email(email_or_phone)
            else:
                user = repo.get_by_number(email_or_phone)

            if not user:
                return {"status": "error", "message": "Invalid credentials"}, 404

            if not check_password_hash(user.password_hash, schema.password):
                return {"status": "error", "message": "Invalid credentials"}, 401

            user_id_str = str(user.id)
            access_token = create_access_token(identity=user_id_str)
            refresh_token = create_refresh_token(identity=user_id_str)
            exp = decode_token(access_token)["exp"]

            return {
                "status": "success",
                "message": {
                    "access_token": access_token,
                    "expires_at": exp,
                    "refresh_token": refresh_token,
                    "user_id": user_id_str,
                    "name": f"{user.name} {user.last}",
                },
            }, 200
        except Exception as e:
            logger.exception("Login error: %s", e)
            return {"status": "error", "message": "Could not handle the user login"}, 500


@api.route("/refresh-token")
class RefreshTokenResource(Resource):
    @jwt_required(refresh=True)
    def post(self) -> ResponseTuple:
        try:
            user_id = get_jwt_identity()
            access_token = create_access_token(identity=user_id)
            exp = decode_token(access_token)["exp"]
            return {
                "status": "success",
                "message": {"access_token": access_token, "expires_at": exp},
            }, 200
        except Exception as e:
            logger.exception("Token refresh error: %s", e)
            return {"status": "error", "message": "Could not refresh the token"}, 500


@api.route("/google")
class GoogleAuthResource(Resource):
    def post(self) -> ResponseTuple:
        try:
            data = request.json
            email = data.get("email")
            name = data.get("name")

            if not email or not name:
                return {"status": "error", "message": "Missing profile data"}, 400

            repo = UserRepository()
            user = repo.get_by_email(email)

            if not user:
                return {"status": "success", "message": {"email": email, "name": name}}, 200
            return {"status": "error", "message": "User already registered"}, 400
        except Exception as e:
            logger.exception("Google auth error: %s", e)
            return {"status": "error", "message": "Could not handle Google login"}, 500


@api.route("/google-login")
class GoogleLoginResource(Resource):
    def post(self) -> ResponseTuple:
        data = request.json
        google_id_token = data.get("id_token")
        if not google_id_token:
            return {"status": "error", "message": "Missing Google ID token"}, 400
        try:
            decoded_token = id_token.verify_oauth2_token(
                google_id_token, google_requests.Request(), s.GOOGLE_CLIENT_ID
            )
            email = decoded_token.get("email")
            if not email:
                return {"status": "error", "message": "No email found in Google token"}, 400

            repo = UserRepository()
            user = repo.get_by_email(email)
            if not user:
                return {"status": "error", "message": "User not found"}, 404
            if user.auth_provider != "google":
                return {"status": "error", "message": "User is not registered with Google"}, 401

            user_id_str = str(user.id)
            access_token = create_access_token(identity=user_id_str)
            refresh_token = create_refresh_token(identity=user_id_str)
            exp = decode_token(access_token)["exp"]

            return {
                "status": "success",
                "message": {
                    "access_token": access_token,
                    "expires_at": exp,
                    "refresh_token": refresh_token,
                    "user_id": user_id_str,
                    "name": f"{user.name} {user.last}",
                },
            }, 200
        except ValueError:
            return {"status": "error", "message": "Invalid Google ID token"}, 400
        except Exception as e:
            return {"status": "error", "message": f"Could not handle Google login, {e}"}, 500


@api.route("/notifications/player-id")
class PlayerIDResource(Resource):
    method_decorators = [jwt_required()]

    def post(self) -> ResponseTuple:
        try:
            raw_data = request.get_json()
            schema = PlayerIDRequest(**raw_data)
            user_id = get_jwt_identity()

            try:
                user_uuid = uuid.UUID(user_id)
            except (ValueError, AttributeError):
                return {"status": "error", "message": "Invalid user identity"}, 401

            from sqlalchemy.dialects.postgresql import insert

            now = datetime.now(UTC)
            stmt = (
                insert(NotificationDevice)
                .values(
                    user_id=user_uuid,
                    player_id=schema.player_id,
                    platform=schema.platform,
                    last_used=now,
                )
                .on_conflict_do_update(
                    constraint="uq_notification_device_user_player",
                    set_={"last_used": now, "platform": schema.platform},
                )
            )
            db.session.execute(stmt)
            db.session.commit()
            return {"status": "success", "message": "Player ID saved"}, 200
        except ValidationError as ve:
            return {"status": "error", "message": ve.errors()}, 400
        except Exception as e:
            db.session.rollback()
            logger.exception("Error saving player ID: %s", e)
            return {"status": "error", "message": "Failed to save player ID"}, 500
