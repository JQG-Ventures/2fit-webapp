import logging
import uuid
from datetime import datetime
from random import randint

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Api, Resource
from openai import OpenAI
from pydantic import ValidationError as PydanticValidationError
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

import app.settings as s
from app.extensions import db
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.progress_repository import ActiveChallengeRepository, ActivePlanRepository
from app.repositories.user_repository import UserRepository
from app.schemas.progress import CompletedWorkoutCreate
from app.schemas.user import UserResponse, UserUpdate
from app.services.azure_service import AzureService
from app.services.chat_service import ChatService
from app.services.user_workout_service import UserWorkoutService

users_bp = Blueprint("users_bp", __name__)
api = Api(users_bp, doc="/docs")
logger = logging.getLogger(__name__)
codes: dict[str, str] = {}

ResponseBody = dict[str, object]
ResponseTuple = tuple[ResponseBody, int]


@api.route("/workouts/complete")
class CompleteWorkoutResource(Resource):
    @jwt_required()
    def post(self) -> ResponseTuple:
        try:
            user_id = get_jwt_identity()
            if not isinstance(user_id, str):
                return {"status": "error", "message": "Missing required parameter: user_id"}, 400

            data = request.get_json()
            data["date"] = datetime.now().isoformat()

            try:
                validated = CompletedWorkoutCreate(**data)
            except Exception as err:
                return {"status": "error", "message": "Invalid input", "errors": str(err)}, 400

            UserWorkoutService.save_completed_workout(user_id, validated.model_dump())
            db.session.commit()
            return {"status": "success", "message": "Workout saved successfully"}, 200
        except Exception as e:
            db.session.rollback()
            logger.exception("Error saving completed workout: %s", e)
            return {"status": "error", "message": "Internal server error"}, 500


@api.route("/workouts/progress")
class UserProgressResource(Resource):
    @jwt_required()
    def get(self) -> ResponseTuple:
        try:
            user_id = get_jwt_identity()
            workout_plan_id = request.args.get("workout_plan_id")
            if not isinstance(user_id, str):
                return {"status": "error", "message": "Missing required parameter: user_id"}, 400
            if not workout_plan_id:
                return {
                    "status": "error",
                    "message": "Missing required parameter: workout_plan_id",
                }, 400

            progress = UserWorkoutService.get_user_progress(user_id, workout_plan_id)
            return {"status": "success", "message": progress}, 200
        except Exception as e:
            logger.exception("Error retrieving user progress: %s", e)
            return {"status": "error", "message": "Internal server error"}, 500

    @jwt_required()
    def post(self) -> ResponseTuple:
        try:
            user_id = get_jwt_identity()
            workout_plan_id = request.args.get("workout_plan_id")

            if not isinstance(user_id, str):
                return {"status": "error", "message": "Missing required parameter: user_id"}, 400
            if not workout_plan_id:
                return {
                    "status": "error",
                    "message": "Missing required parameter: workout_plan_id",
                }, 400

            data = request.get_json()
            if not data:
                return {"status": "error", "message": "Missing request JSON body"}, 400

            data["date"] = datetime.now().isoformat()

            if (
                "exercises" not in data
                or not isinstance(data["exercises"], list)
                or not data["exercises"]
            ):
                return {"status": "error", "message": "Exercises must be a non-empty list"}, 400

            UserWorkoutService.save_workout_progress(user_id, workout_plan_id, data)
            db.session.commit()
            return {"status": "success", "message": "Progress updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            logger.exception("Error saving workout progress: %s", e)
            return {"status": "error", "message": "Internal server error"}, 500


@api.route("/messages/motivational")
class MotivationalMessagesResource(Resource):
    def post(self) -> ResponseTuple:
        try:
            chat_service = ChatService(OpenAI(api_key=s.OPENAI_API_KEY))
            response = chat_service.generate_motivational_phrases()
            if response:
                return {"status": "success", "message": response}, 200
            return {"status": "error", "message": "No motivational messages generated"}, 500
        except Exception as e:
            logger.exception("Error generating motivational messages: %s", e)
            return {"status": "error", "message": "Could not handle the message"}, 500


@api.route("/profile")
class UserResource(Resource):
    method_decorators = [jwt_required()]

    def get(self) -> ResponseTuple:
        try:
            user_id = get_jwt_identity()
            if not isinstance(user_id, str):
                return {"status": "error", "message": "User not authenticated"}, 401

            repo = UserRepository()
            user = repo.get_by_id(uuid.UUID(user_id))
            if user:
                result = UserResponse.model_validate(user, from_attributes=True).model_dump(
                    by_alias=True
                )
                return {"status": "success", "message": result}, 200
            return {"status": "error", "message": "User not found"}, 404
        except Exception as e:
            logger.exception("An error occurred: %s", e)
            return {"status": "error", "message": f"An error occurred: {str(e)}"}, 500

    def put(self) -> ResponseTuple:
        try:
            user_id = get_jwt_identity()
            if not isinstance(user_id, str):
                return {"status": "error", "message": "User not authenticated"}, 401

            data = request.json

            try:
                schema = UserUpdate(**data)
            except PydanticValidationError as err:
                return {"status": "error", "message": err.errors()}, 400

            safe_data = schema.model_dump(exclude_unset=True)
            if not safe_data:
                return {"status": "error", "message": "No valid fields to update"}, 400

            repo = UserRepository()
            updated = repo.update_profile(uuid.UUID(user_id), safe_data)
            db.session.commit()
            if updated:
                return {"status": "success", "message": "User successfully updated"}, 200
            return {"status": "error", "message": "User not found"}, 404
        except Exception as e:
            db.session.rollback()
            logger.exception("An error occurred: %s", e)
            return {"status": "error", "message": f"An error occurred: {str(e)}"}, 500


@api.route("/send-code")
class SendCodeResource(Resource):
    def post(self) -> ResponseTuple:
        payload = request.get_json(silent=True) or {}
        phone_number = payload.get("number")
        if not phone_number:
            return {"status": "error", "message": "Phone number is required"}, 400

        code = str(randint(1000, 9999))
        codes[phone_number] = code

        try:
            client = Client(s.TWILIO_ENCRYPTED_USER, s.TWILIO_ENCRYPTED_PASSWORD)
            client.verify.v2.services(s.TWILIO_SERVICE_SID).verifications.create(
                to=f"{phone_number}", channel="sms"
            )
            return {"status": "success", "message": "Verification code sent"}, 200
        except TwilioRestException as te:
            logger.exception("Twilio error: %s", te)
            return {
                "status": "error",
                "message": f"Twilio could not send the code: {te}",
            }, te.status
        except Exception as e:
            logger.exception("Error sending verification code: %s", e)
            return {"status": "error", "message": f"Error sending verification code: {e}"}, 500


@api.route("/verify-code")
class VerifyCodeResource(Resource):
    def post(self) -> ResponseTuple:
        payload = request.get_json(silent=True) or {}
        phone_number = payload.get("number")
        code_entered = payload.get("code")

        if not phone_number or not code_entered:
            return {"status": "error", "message": "Phone number and code are required"}, 400

        correct_code = codes.get(phone_number)
        if correct_code == code_entered:
            return {"status": "success", "message": "Code verified"}, 200
        return {"status": "error", "message": "Invalid code"}, 400


@api.route("/conversation")
class UserConversationResource(Resource):
    @jwt_required()
    def get(self) -> ResponseTuple:
        try:
            user_id = get_jwt_identity()
            if not isinstance(user_id, str):
                return {"status": "error", "message": "User not authenticated"}, 401

            repo = ConversationRepository()
            conversation = repo.get_by_user(uuid.UUID(user_id))
            if conversation:
                messages = [{"role": m.role, "content": m.content} for m in conversation.messages]
                return {"status": "success", "message": messages}, 200
            return {"status": "success", "message": []}, 200
        except Exception as e:
            logger.exception("An error occurred: %s", e)
            return {"status": "error", "message": f"An error occurred: {str(e)}"}, 500


@api.route("/by-number/<string:number>")
class UserByNumberResource(Resource):
    def get(self, number: str) -> ResponseTuple:
        try:
            repo = UserRepository()
            user = repo.get_by_number(number)
            if user:
                result = UserResponse.model_validate(user, from_attributes=True).model_dump(
                    by_alias=True
                )
                return {"status": "success", "message": result}, 200
            return {"status": "error", "message": "User not found"}, 404
        except Exception as e:
            logger.exception("An error occurred: %s", e)
            return {"status": "error", "message": f"An error occurred: {str(e)}"}, 500


@api.route("/by-email/<string:email>")
class UserByEmailResource(Resource):
    def get(self, email: str) -> ResponseTuple:
        try:
            repo = UserRepository()
            user = repo.get_by_email(email)
            if user:
                result = UserResponse.model_validate(user, from_attributes=True).model_dump(
                    by_alias=True
                )
                return {"status": "success", "message": result}, 200
            return {"status": "error", "message": "User not found"}, 404
        except Exception as e:
            logger.exception("An error occurred: %s", e)
            return {"status": "error", "message": f"An error occurred: {str(e)}"}, 500


@api.route("/active-plans")
class UserResourcePlans(Resource):
    @jwt_required()
    def get(self) -> ResponseTuple:
        try:
            user_id = get_jwt_identity()
            if not isinstance(user_id, str):
                return {"status": "error", "message": "User not authenticated"}, 401

            user_uuid = uuid.UUID(user_id)
            result: list[dict[str, object]] = []

            plan_repo = ActivePlanRepository()
            plans = plan_repo.get_by_user(user_uuid)
            for p in plans:
                if not p.is_completed:
                    result.append(
                        {
                            "id": str(p.id),
                            "type": p.plan_type,
                            "name": p.workout_name,
                            "plan_type": p.plan_type,
                        }
                    )

            challenge_repo = ActiveChallengeRepository()
            active_challenges = challenge_repo.get_all_for_user(user_uuid)
            for ac in active_challenges:
                result.append(
                    {
                        "id": str(ac.id),
                        "type": "challenge",
                        "name": ac.challenge.name if ac.challenge else "",
                        "plan_type": "challenge",
                    }
                )

            if result:
                return {"status": "success", "message": result}, 200
            return {"status": "error", "message": "Plans not found"}, 404
        except Exception as e:
            logger.exception("An error occurred: %s", e)
            return {"status": "error", "message": f"{str(e)}"}, 500


@api.route("/profile/image")
class UserProfileImageResource(Resource):
    @jwt_required()
    def post(self) -> ResponseTuple:
        try:
            user_id = get_jwt_identity()
            if not isinstance(user_id, str):
                return {"status": "error", "message": "User not authenticated"}, 401

            if "image" not in request.files:
                return {"status": "error", "message": "No image file provided"}, 400

            image = request.files["image"]
            filename = image.filename or ""
            if filename == "":
                return {"status": "error", "message": "No selected file"}, 400

            azure_service = AzureService()
            blob_url = azure_service.upload_profile_image(image.stream, user_id, filename)
            if not blob_url:
                return {"status": "error", "message": "Failed to upload image"}, 500

            repo = UserRepository()
            updated = repo.update_profile(uuid.UUID(user_id), {"profile_image": blob_url})
            db.session.commit()

            if updated:
                return {
                    "status": "success",
                    "message": "Profile image updated successfully",
                    "url": blob_url,
                }, 200
            return {"status": "error", "message": "Failed to update profile image"}, 500
        except Exception as e:
            db.session.rollback()
            logger.exception("Error processing profile image upload: %s", e)
            return {"status": "error", "message": "Internal server error"}, 500
