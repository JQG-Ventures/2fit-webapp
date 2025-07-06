"""
Routes for managing workout challenges and tracking user progress.

This module defines the API endpoints for creating, retrieving, updating,
deleting, and tracking progress for workout challenges. It uses Flask-RESTx
for route definitions and integrates with challenge-related services and models.
"""

from datetime import datetime
from app.services.user_challenge_service import UserChallengeService
from app.services.user_workout_service import UserWorkoutService
from flask import Blueprint, request
from flask_restx import Api, Resource, fields
from app.Schemas.challenge_schema import challenge_schema, challenges_schema
from marshmallow import ValidationError
from typing import Tuple, Any
from app.models.challenges import ChallengeModel
from flask_jwt_extended import get_jwt_identity, jwt_required

import logging


challenges_bp = Blueprint("challenges_bp", __name__)
api = Api(challenges_bp, doc="/docs")


challenge_exercise_model = api.model(
    "ChallengeExercise",
    {
        "exercise_id": fields.String(required=True),
        "sets": fields.Integer(required=True),
        "reps": fields.Integer(required=True),
        "rest_seconds": fields.Integer(required=True),
    },
)

challenge_day_model = api.model(
    "ChallengeDay",
    {
        "sequence_day": fields.Integer(required=True),
        "name": fields.String(required=True),
        "is_rest": fields.Boolean(required=True),
        "exercises": fields.List(fields.Nested(challenge_exercise_model)),
    },
)

challenge_model = api.model(
    "Challenge",
    {
        "name": fields.String(required=True),
        "description": fields.String(),
        "plan_type": fields.String(required=True, default="challenge"),
        "duration_days": fields.Integer(required=True),
        "price": fields.Float(required=True),
        "image_url": fields.String(),
        "video_url": fields.String(),
        "equipment": fields.List(fields.String),
        "workout_schedule": fields.List(fields.Nested(challenge_day_model), required=True),
        "level": fields.String(enum=["beginner", "intermediate", "advanced"]),
        "is_active": fields.Boolean(),
        "category": fields.List(
            fields.String, description="List of category tags for the challenge"
        ),
        "intenisty": fields.Boolean(),
    },
)


@api.route("/challenges")
class ChallengeListResource(Resource):
    """Handles listing and creation of workout challenges."""

    @api.doc("get_all_challenges")
    @api.response(200, "Success")
    def get(self) -> Tuple[dict[str, Any], int]:
        """
        Retrieve all active challenges.

        Returns:
            A tuple containing the response dict and HTTP status code.
        """
        try:
            challenges = ChallengeModel.get_all()
            return {"status": "success", "message": challenges_schema.dump(challenges)}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.doc("create_challenge")
    @api.expect(challenge_model, validate=True)
    @api.response(201, "Challenge created")
    def post(self) -> Tuple[dict[str, Any], int]:
        """
        Create a new workout challenge.

        Expects:
            JSON body matching the challenge schema.

        Returns:
            A tuple with the new challenge ID and HTTP status code.
        """
        try:
            data = request.get_json()

            if data is None:
                return {"status": "error", "message": "Body JSON requerido"}, 400

            challenge = challenge_schema.load(data)
            challenge_id = ChallengeModel.create(challenge)
            return {"status": "success", "message": str(challenge_id)}, 201
        except ValidationError as err:
            return {"status": "error", "message": err.messages}, 400
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/challenges/<string:challenge_id>")
class ChallengeResource(Resource):
    """Handles retrieval, update, and deletion of a specific challenge by ID."""

    @api.doc("get_challenge_by_id")
    @api.response(200, "Success")
    @api.response(404, "Not found")
    def get(self, challenge_id: str) -> Tuple[dict[str, Any], int]:
        """
        Retrieve a challenge by its ID.

        Args:
            challenge_id: The ID of the challenge to retrieve.

        Returns:
            The challenge data or a 404 error if not found.
        """
        try:
            challenge = ChallengeModel.get_by_id(challenge_id)
            if challenge:
                return {"status": "success", "message": challenge}, 200
            return {"status": "error", "message": "Challenge not found"}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.doc("update_challenge")
    @api.expect(challenge_model)
    @api.response(200, "Challenge updated")
    def put(self, challenge_id: str) -> Tuple[dict[str, Any], int]:
        """
        Update a challenge by its ID.

        Args:
            challenge_id: The ID of the challenge to update.

        Returns:
            Success or 404 error depending on update result.
        """
        try:
            data = request.get_json()

            if data is None:
                return {"status": "error", "message": "Body JSON requerido"}, 400

            challenge_data = challenge_schema.load(data)
            updated = ChallengeModel.update(challenge_id, challenge_data)
            if updated:
                return {"status": "success", "message": "Challenge updated"}, 200
            return {"status": "error", "message": "Challenge not found"}, 404
        except ValidationError as err:
            return {"status": "error", "message": err.messages}, 400
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.doc("delete_challenge")
    @api.response(200, "Challenge deleted")
    def delete(self, challenge_id: str) -> Tuple[dict[str, Any], int]:
        """
        Mark a challenge as inactive instead of deleting it from the database.

        Args:
            challenge_id: The ID of the challenge to deactivate.

        Returns:
            True if the challenge was updated, False otherwise.
        """
        try:
            deleted = ChallengeModel.delete(challenge_id)
            if deleted:
                return {"status": "success", "message": "Challenge deleted"}, 200
            return {"status": "error", "message": "Challenge not found"}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/challenges/progress")
class UserChallengeProgressResource(Resource):
    """Guarda el progreso parcial de un día de challenge para un usuario."""

    @api.param("challenge_id", "ID del challenge", required=True)
    @jwt_required()
    @api.response(200, "Progreso obtenido correctamente")
    @api.response(400, "Faltan parámetros", response_model=None)
    @api.response(500, "Error interno", response_model=None)
    def get(self):
        """
        Retrieve the current user's progress for a specific challenge.

        Query Parameters:
            challenge_id: The challenge ID to retrieve progress for.

        Returns:
            The progress data or an error message.
        """
        try:
            user_id = get_jwt_identity()
            challenge_id = request.args.get("challenge_id")
            if not user_id:
                return {"status": "error", "message": "Falta user_id"}, 400
            if not challenge_id:
                return {"status": "error", "message": "Falta challenge_id"}, 400

            progress = UserWorkoutService.get_challenge_progress(user_id, challenge_id)
            return {"status": "success", "message": progress}, 200
        except Exception as e:
            logging.exception(f"Error al obtener progreso del challenge: {e}")
            return {"status": "error", "message": "Internal server error"}, 500

    @api.param("challenge_id", "ID del challenge", required=True)
    @jwt_required()
    @api.response(200, "Progreso de challenge guardado exitosamente")
    @api.response(400, "Invalid input")
    @api.response(500, "Internal server error")
    def post(self):
        """
        Save the user's partial progress for a specific challenge day.

        Body:
            JSON with keys: sequence_day, exercises (list of performed exercises).

        Returns:
            A success or error response.
        """
        try:
            user_id = get_jwt_identity()
            challenge_id = request.args.get("challenge_id")
            if not user_id or not challenge_id:
                return {"status": "error", "message": "Falta challenge_id o usuario"}, 400

            data = request.get_json()
            if not data:
                return {"status": "error", "message": "Body JSON requerido"}, 400

            data["date"] = datetime.now().isoformat()

            if (
                "sequence_day" not in data
                or "exercises" not in data
                or not isinstance(data["exercises"], list)
            ):
                return {"status": "error", "message": "Campos inválidos en el JSON"}, 400

            UserChallengeService.save_challenge_progress(user_id, challenge_id, data)
            return {"status": "success", "message": "Progreso guardado"}, 200

        except Exception as e:
            logging.exception(f"Error guardando progreso challenge: {e}")
            return {"status": "error", "message": "Internal server error"}, 500


@api.route("/challenges/complete")
class CompleteChallengeResource(Resource):
    """Guarda el challenge completo para un usuario."""

    @jwt_required()
    @api.response(200, "Challenge completado guardado exitosamente")
    @api.response(400, "Invalid input")
    @api.response(500, "Internal server error")
    def post(self):
        """
        Mark a challenge as fully completed by the user.

        Body:
            JSON with challenge_id, sequence_day, and exercises.

        Returns:
            Success or error message.
        """
        try:
            user_id = get_jwt_identity()
            if not user_id:
                return {"status": "error", "message": "Falta usuario"}, 400

            data = request.get_json()
            if not data:
                return {"status": "error", "message": "Body JSON requerido"}, 400

            data["date"] = datetime.now().isoformat()

            if "challenge_id" not in data or "sequence_day" not in data or "exercises" not in data:
                return {"status": "error", "message": "Campos inválidos en el JSON"}, 400

            UserChallengeService.save_completed_challenge(user_id, data)
            return {"status": "success", "message": "Challenge completado guardado"}, 200

        except Exception as e:
            logging.exception(f"Error guardando challenge completo: {e}")
            return {"status": "error", "message": "Internal server error"}, 500
