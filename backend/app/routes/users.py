from random import random

from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client
from app.extensions import mongo
from app.models.user import User
from app.services.azure_service import AzureService
from app.services.chat_service import ChatService
from app.services.user_workout_service import UserWorkoutService
from datetime import datetime
from flask import Blueprint, request
from flask_restx import Api, Resource, fields, ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
from openai import OpenAI
from app.Schemas.UserSchema import executedWorkoutSchema

import app.settings as s
import logging


users_bp = Blueprint("users_bp", __name__)
api = Api(users_bp, doc="/docs")
logger = logging.getLogger(__name__)
codes = {}


executed_exercise_model = api.model(
    "ExecutedExercise",
    {
        "exercise_id": fields.String(required=True, description="ID of the exercise"),
        "sets_completed": fields.Integer(required=True, description="Number of sets completed"),
        "reps_completed": fields.List(fields.Integer(), description="Number of reps completed"),
        "duration_seconds": fields.Integer(required=True, description="Duration in seconds"),
        "calories_burned": fields.Float(required=True, description="Calories burned"),
        "is_completed": fields.Boolean(
            default=True, description="Whether the exercise was completed"
        ),
    },
)

completed_workout_model = api.model(
    "CompletedWorkout",
    {
        "workout_id": fields.String(required=True, description="ID of the workout"),
        "duration_seconds": fields.Integer(required=True, description="Total duration in seconds"),
        "calories_burned": fields.Float(required=True, description="Total calories burned"),
        "exercises": fields.List(
            fields.Nested(executed_exercise_model),
            required=True,
            description="List of completed exercises",
        ),
        "day_of_week": fields.Integer(),
        "sequence_day": fields.Integer(),
        "was_skipped": fields.Boolean(required=True),
    },
)

progress_response_model = api.model(
    "ProgressResponse",
    {
        "progress": fields.Float(description="User progress in percentage"),
        "exercises_left": fields.List(fields.Raw, description="List of exercises left for today"),
    },
)

response_model = api.model(
    "ErrorModel",
    {
        "status": fields.String(description="Status of the request"),
        "message": fields.String(description="Error message"),
    },
)

progress_success_response_model = api.model(
    "ErrorModel",
    {
        "status": fields.Nested(progress_response_model, description="Progress response"),
        "message": fields.String(description="Error message"),
    },
)

user_model = api.model(
    "User",
    {
        "_id": fields.String(description="User ID"),
        "name": fields.String(description="First name"),
        "last": fields.String(description="Last name"),
        # TODO: Add other user fields as necessary
    },
)

user_response_model = api.model(
    "UserResponse",
    {
        "status": fields.String(description="Status of the request"),
        "message": fields.Nested(user_model, description="User information"),
    },
)

progress_update_model = api.model(
    "ProgressUpdate",
    {
        "exercises": fields.List(
            fields.Nested(
                api.model(
                    "ExerciseProgress",
                    {
                        "exercise_id": fields.String(
                            required=True, description="ID of the exercise"
                        ),
                        "sets_completed": fields.Integer(
                            required=True,
                            description="Number of sets completed",
                        ),
                        "reps_completed": fields.List(
                            fields.Integer,
                            required=True,
                            description="List of reps completed for each set",
                        ),
                        "duration_seconds": fields.Integer(
                            required=True,
                            description="Duration spent on the exercise in seconds",
                        ),
                        "calories_burned": fields.Float(
                            required=True,
                            description="Calories burned during the exercise",
                        ),
                        "is_completed": fields.Boolean(
                            required=True,
                            description="Whether the exercise is completed",
                        ),
                    },
                )
            ),
            required=True,
            description="List of exercises with progress updates",
        ),
        "day_of_week": fields.String(description='Day of the week (e.g., "monday")'),
        "sequence_day": fields.Integer(description="Sequence day in the plan"),
    },
)

profile_image_response_model = api.model(
    "ProfileImageResponse",
    {
        "status": fields.String(description="Status of the request"),
        "message": fields.String(description="Result message"),
        "url": fields.String(description="URL of the uploaded profile image"),
    },
)


@api.route("/workouts/complete")
class CompleteWorkoutResource(Resource):
    @api.expect(completed_workout_model)
    @jwt_required()
    @api.response(200, "Workout saved successfully", response_model)
    @api.response(400, "Invalid input", response_model)
    @api.response(500, "Internal server error", response_model)
    def post(self):
        """
        Save a completed workout for a user.
        """
        try:
            user_id = get_jwt_identity()
            if not user_id:
                return {
                    "status": "error",
                    "message": "Missing required parameter: user_id",
                }, 400

            data = request.get_json()
            data["date"] = datetime.now().isoformat()

            try:
                validated_data = executedWorkoutSchema.load(data)
            except ValidationError as err:
                return {
                    "status": "error",
                    "message": "Invalid input",
                    "errors": err.messages,
                }, 400

            UserWorkoutService.save_completed_workout(user_id, validated_data)
            return {
                "status": "success",
                "message": "Workout saved successfully",
            }, 200

        except Exception as e:
            logger.exception(f"Error saving completed workout: {e}")
            return {"status": "error", "message": "Internal server error"}, 500


@api.route("/workouts/progress")
class UserProgressResource(Resource):
    @api.param("workout_plan_id", "ID of the workout plan", required=True)
    @jwt_required()
    @api.response(200, "Progress retrieved successfully", progress_success_response_model)
    @api.response(400, "Invalid input", response_model)
    @api.response(500, "Internal server error", response_model)
    def get(self):
        """
        Get user progress in a workout plan.
        """
        try:
            user_id = get_jwt_identity()
            workout_plan_id = request.args.get("workout_plan_id")
            if not user_id:
                return {
                    "status": "error",
                    "message": "Missing required parameter: user_id",
                }, 400
            if not workout_plan_id:
                return {
                    "status": "error",
                    "message": "Missing required parameter: workout_plan_id",
                }, 400

            progress = UserWorkoutService.get_user_progress(user_id, workout_plan_id)
            return {"status": "success", "message": progress}, 200

        except Exception as e:
            logger.exception(f"Error retrieving user progress: {e}")
            return {"status": "error", "message": "Internal server error"}, 500

    @api.expect(progress_update_model)
    @jwt_required()
    @api.param("workout_plan_id", "ID of the workout plan", required=True)
    @api.response(200, "Progress updated successfully")
    @api.response(400, "Invalid input", response_model)
    @api.response(500, "Internal server error", response_model)
    def post(self):
        """
        Save progress of a workout session for a user.
        """
        try:
            user_id = get_jwt_identity()
            workout_plan_id = request.args.get("workout_plan_id")

            if not user_id:
                return self._error_response("Missing required parameter: user_id")

            data = request.get_json()
            if not data:
                return self._error_response("Missing request JSON body")

            data["date"] = datetime.now().isoformat()

            validation_error = self._validate_data(data)
            if validation_error:
                return validation_error

            UserWorkoutService.save_workout_progress(user_id, workout_plan_id, data)
            return {"status": "success", "message": "Progress updated successfully"}, 200

        except Exception as e:
            logger.exception(f"Error saving workout progress: {e}")
            return {"status": "error", "message": "Internal server error"}, 500

    def _validate_data(self, data):
        required_fields = ["date", "exercises"]

        for field in required_fields:
            if field not in data:
                return self._error_response(f"Missing required field: {field}")

        if not isinstance(data["exercises"], list) or not data["exercises"]:
            return self._error_response("Exercises must be a non-empty list")

        try:
            datetime.strptime(data["date"], "%Y-%m-%dT%H:%M:%S.%f")
        except ValueError:
            return self._error_response(
                "Invalid date format. Expected ISO format: YYYY-MM-DDTHH:MM:SS.mmmmmm"
            )

        return None

    def _error_response(self, message, status_code=400):
        return {"status": "error", "message": message}, status_code


motivational_messages_response_model = api.model(
    "MotivationalMessagesResponse",
    {
        "status": fields.String(description="Status of the request"),
        "message": fields.List(fields.String, description="List of motivational phrases"),
    },
)


@api.route("/messages/motivational")
class MotivationalMessagesResource(Resource):
    @api.response(
        200,
        "Motivational messages retrieved successfully",
        motivational_messages_response_model,
    )
    @api.response(500, "Could not handle the message", response_model)
    def post(self):
        """
        Get motivational messages.
        """
        try:
            chat_service = ChatService(OpenAI(api_key=s.OPENAI_API_KEY))
            response = chat_service.generate_motivational_phrases()

            if response:
                return {"status": "success", "message": response}, 200
            else:
                return {
                    "status": "error",
                    "message": "No motivational messages generated",
                }, 500

        except Exception as e:
            logger.exception(f"There was a problem handling the message, error: {e}")
            return {
                "status": "error",
                "message": "Could not handle the message",
            }, 500


@api.route("/profile")
class UserResource(Resource):
    method_decorators = [jwt_required()]

    @api.doc("get_user_profile_by_id")
    @api.response(200, "User information retrieved successfully", user_response_model)
    @api.response(404, "User not found", response_model)
    @api.response(500, "Internal server error", response_model)
    def get(self):
        """
        Get user information by ID.
        """
        try:
            user_id = get_jwt_identity()
            user_info = User.get_user_by_id(user_id)

            if user_info:
                return {"status": "success", "message": user_info}, 200
            else:
                return {"status": "error", "message": "User not found"}, 404

        except Exception as e:
            logger.exception(f"An error occurred: {e}")
            return {
                "status": "error",
                "message": f"An error occurred: {str(e)}",
            }, 500

    @api.expect(user_model)
    @api.response(200, "User updated successfully", response_model)
    @api.response(404, "User not found", response_model)
    @api.response(500, "Internal server error", response_model)
    def put(self):
        """
        Update user information by ID.
        """
        try:
            user_id = get_jwt_identity()
            data = request.json
            user_info = User.update_user_data(user_id, data)

            if user_info:
                return {
                    "status": "success",
                    "message": "User successfully updated",
                }, 200
            else:
                return {"status": "error", "message": "User not found"}, 404
        except Exception as e:
            logger.exception(f"An error occurred: {e}")
            return {
                "status": "error",
                "message": f"An error occurred: {str(e)}",
            }, 500


send_code_model = api.model(
    "SendCode",
    {
        "number": fields.String(
            required=True,
            description="User phone number",
            example="+1234567890",
        )
    },
)


@api.route("/send-code")
class SendCodeResource(Resource):
    @api.expect(send_code_model)
    @api.response(200, "Verification code sent successfully", response_model)
    @api.response(400, "Phone number is required", response_model)
    @api.response(500, "Error sending verification code", response_model)
    def post(self):
        """
        Send verification code to user phone number.
        """
        phone_number = request.json.get("number")
        if not phone_number:
            return {
                "status": "error",
                "message": "Phone number is required",
            }, 400

        code = str(random.randint(1000, 9999))
        codes[phone_number] = code

        try:
            client = Client(s.TWILIO_ENCRYPTED_USER, s.TWILIO_ENCRYPTED_PASSWORD)
            client.verify.v2.services(s.TWILIO_SERVICE_SID).verifications.create(
                to=f"{phone_number}", channel="sms"
            )
            return {
                "status": "success",
                "message": "Verification code sent",
            }, 200
        except TwilioRestException as te:
            logger.exception(f"Twilio could not send the code: {te}")
            return {
                "status": "error",
                "message": f"Twilio could not send the code: {te}",
            }, te.status
        except Exception as e:
            logger.exception(f"There was a problem sending the verification code: {e}")
            return {
                "status": "error",
                "message": f"There was a problem sending the verification code: {e}",
            }, 500


verify_code_model = api.model(
    "VerifyCode",
    {
        "number": fields.String(
            required=True,
            description="User phone number",
            example="+1234567890",
        ),
        "code": fields.String(required=True, description="Verification code", example="1234"),
    },
)


@api.route("/verify-code")
class VerifyCodeResource(Resource):
    @api.expect(verify_code_model)
    @api.response(200, "Code verified successfully", response_model)
    @api.response(400, "Phone number and code are required", response_model)
    def post(self):
        """
        Verify the entered code against the stored code.
        """
        phone_number = request.json.get("number")
        code_entered = request.json.get("code")

        if not phone_number or not code_entered:
            return {
                "status": "error",
                "message": "Phone number and code are required",
            }, 400

        correct_code = codes.get(phone_number)

        if correct_code == code_entered:
            return {"status": "success", "message": "Code verified"}, 200
        else:
            return {"status": "error", "message": "Invalid code"}, 400


conversation_model = api.model(
    "Conversation",
    {
        # TODO: Define fields as appropriate
        "messages": fields.List(fields.String, description="List of messages")
    },
)


conversation_response_model = api.model(
    "ConversationResponse",
    {
        "status": fields.String(description="Status of the request"),
        "message": fields.Nested(conversation_model, description="User conversation"),
    },
)


@api.route("/conversation")
class UserConversationResource(Resource):
    @api.doc("get_conversation_by_user_id")
    @jwt_required()
    @api.response(
        200,
        "User conversation retrieved successfully",
        conversation_response_model,
    )
    @api.response(404, "Conversation not found", response_model)
    @api.response(500, "Internal server error", response_model)
    def get(self):
        """Get user conversation by ID."""
        try:
            user_id = get_jwt_identity()
            user_chat = User.get_user_chat_by_id(user_id)

            return {"status": "success", "message": user_chat}, 200

        except Exception as e:
            logger.exception(f"An error occurred: {e}")
            return {
                "status": "error",
                "message": f"An error occurred: {str(e)}",
            }, 500


@api.route("/by-number/<string:number>")
class UserByNumberResource(Resource):
    @api.response(200, "User information retrieved successfully", user_response_model)
    @api.response(404, "User not found", response_model)
    @api.response(500, "Internal server error", response_model)
    def get(self, number):
        """
        Get user information by number.
        """
        try:
            user_info = User.get_user_by_number(number)

            if user_info:
                return {"status": "success", "message": user_info}, 200
            else:
                return {"status": "error", "message": "User not found"}, 404

        except Exception as e:
            logger.exception(f"An error occurred: {e}")
            return {
                "status": "error",
                "message": f"An error occurred: {str(e)}",
            }, 500


@api.route("/by-email/<string:email>")
class UserByEmailResource(Resource):
    @api.response(200, "User information retrieved successfully", user_response_model)
    @api.response(200, "User information retrieved successfully", user_response_model)
    @api.response(404, "User not found", response_model)
    @api.response(500, "Internal server error", response_model)
    def get(self, email):
        """
        Get user information by email.
        """
        try:
            user_info = User.get_user_by_email(email)

            if user_info:
                return {"status": "success", "message": user_info}, 200
            else:
                return {"status": "error", "message": "User not found"}, 404

        except Exception as e:
            logger.exception(f"An error occurred: {e}")
            return {
                "status": "error",
                "message": f"An error occurred: {str(e)}",
            }, 500


@api.route("/active-plans")
class UserResourcePlans(Resource):
    @jwt_required()
    @api.response(200, "User plans retrieved successfully", response_model)
    @api.response(404, "Plans not found", response_model)
    @api.response(500, "Internal server error", response_model)
    def get(self):
        """
        Get user information by ID.
        """
        try:
            user_id = get_jwt_identity()
            user_plans = User.get_current_active_plans(user_id)

            if user_plans:
                return {"status": "success", "message": user_plans}, 200
            else:
                return {"status": "error", "message": "Plans not found"}, 404
        except Exception as e:
            logger.exception(f"An error occurred: {e}")
            return {"status": "error", "message": f"{str(e)}"}, 500


@api.route("/profile/image")
class UserProfileImageResource(Resource):
    @jwt_required()
    @api.response(200, "Profile image updated successfully", profile_image_response_model)
    @api.response(400, "Invalid input", profile_image_response_model)
    @api.response(500, "Internal server error", profile_image_response_model)
    def post(self):
        """
        Upload a profile image, save it to Azure Blob Storage, and update the user's profile.
        """
        try:
            user_id = get_jwt_identity()
            if not user_id:
                return {
                    "status": "error",
                    "message": "User not authenticated",
                }, 401

            if "image" not in request.files:
                return {
                    "status": "error",
                    "message": "No image file provided",
                }, 400

            image = request.files["image"]
            if image.filename == "":
                return {"status": "error", "message": "No selected file"}, 400

            azure_service = AzureService(mongo.db)
            blob_url = azure_service.upload_profile_image(image.stream, user_id, image.filename)
            if not blob_url:
                return {
                    "status": "error",
                    "message": "Failed to upload image",
                }, 500

            updated = User.update_user_data(user_id, {"profile_image": blob_url})
            if updated:
                return {
                    "status": "success",
                    "message": "Profile image updated successfully",
                    "url": blob_url,
                }, 200
            else:
                return {
                    "status": "error",
                    "message": "Failed to update profile image",
                }, 500

        except Exception as e:
            logger.exception("Error processing profile image upload: %s", e)
            return {"status": "error", "message": "Internal server error"}, 500
