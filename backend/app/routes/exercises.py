"""Defines API routes for managing exercises, including CRUD and similarity features."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from flask_restx import Api, Resource, fields
from marshmallow import ValidationError
from app.models.exercise import Exercise
from app.Schemas.ExerciseSchema import exercise_schema, exercises_schema

import logging


exercises_bp = Blueprint("exercises_bp", __name__)
api = Api(exercises_bp, doc="/docs")


exercise_model = api.model(
    "Exercise",
    {
        "name": fields.String(required=True, description="Exercise name"),
        "description": fields.String(description="Exercise description"),
        "category": fields.String(description="Exercise category"),
        "image_url": fields.String(description="URL of exercise image"),
        "video_url": fields.String(description="URL of exercise video"),
        "muscle_group": fields.List(
            fields.String, required=True, description="Target muscle groups"
        ),
        "difficulty": fields.String(default="Beginner", description="Exercise difficulty level"),
        "equipment": fields.List(
            fields.String,
            default=["body_weight"],
            description="Required equipment",
        ),
        "instructions": fields.List(fields.String, description="Exercise instructions"),
        "contradictions": fields.List(fields.String, description="Exercise contradictions"),
        "is_active": fields.Boolean(default=True, description="Is the exercise active"),
    },
)


@api.route("/exercises")
class ExerciseListResource(Resource):
    """Handles creating and retrieving all exercises."""

    method_decorators = [jwt_required()]

    @api.doc("get_exercises")
    @api.response(200, "Exercise retrieved")
    @api.response(500, "Internal Server Error")
    def get(self) -> tuple[dict[str, str], int]:
        """Retrieve all exercises."""
        try:
            exercises = Exercise.get_exercises()
            return {"status": "success", "message": exercises}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.expect(exercise_model)
    @api.doc("create_exercise")
    @api.response(201, "Exercise created")
    @api.response(400, "Validation Error")
    @api.response(500, "Internal Server Error")
    def post(self) -> tuple[dict[str, str], int]:
        """Create a new exercise."""
        data = request.json

        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400

        try:
            validated_data = exercise_schema.load(data)
            exercise_id = Exercise.create_exercise(validated_data)
            return {"status": "success", "message": str(exercise_id)}, 200
        except ValidationError as err:
            return {"status": "error", "message": str(err.messages)}, 400
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/exercises/bulk")
class BulkExerciseResource(Resource):
    """Handles bulk creation of exercises."""

    @api.doc("create_bulk_exercises")
    @jwt_required()
    @api.expect([exercise_model])
    @api.response(201, "Exercises created")
    @api.response(400, "Validation Error")
    @api.response(500, "Internal Server Error")
    def post(self) -> tuple[dict[str, object], int]:
        """Create multiple exercises in bulk."""
        data = request.json

        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400

        try:
            validated_data = exercises_schema.load(data, many=True)
            exercise_ids = Exercise.create_bulk_exercises(validated_data)

            logging.info(f"Successfully created the exercises: {exercise_ids}")
            return {
                "status": "success",
                "message": {"exercise_ids": exercise_ids},
            }, 201
        except ValidationError as err:
            logging.exception(f"Failed to bulk create the workouts | {err}")
            return {"status": "error", "message": str(err.messages)}, 400
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/exercises/<string:exercise_id>")
class ExerciseResource(Resource):
    """Handles retrieving, updating, and deleting a single exercise by ID."""

    @api.doc("get_exercise_by_id")
    @jwt_required()
    @api.response(200, "Success")
    @api.response(404, "Exercise not found")
    @api.response(500, "Internal Server Error")
    def get(self, exercise_id: str) -> tuple[dict[str, str], int]:
        """Get an exercise by its ID."""
        try:
            exercise = Exercise.get_exercise_by_id(exercise_id)
            if exercise:
                return {"status": "success", "data": exercise}, 200
            return {"status": "error", "message": "Exercise not found"}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.doc("update_exercise")
    @jwt_required()
    @api.expect(exercise_model)
    @api.response(200, "Exercise updated")
    @api.response(400, "Validation Error")
    @api.response(404, "Exercise not found")
    @api.response(500, "Internal Server Error")
    def put(self, exercise_id: str) -> tuple[dict[str, str], int]:
        """Update an exercise by its ID."""
        data = request.json

        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400

        try:
            validated_data = exercise_schema.load(data)
            updated = Exercise.update_exercise(exercise_id, validated_data)

            if updated:
                return {
                    "status": "success",
                    "message": "Exercise updated",
                }, 200
            return {"status": "error", "message": "Exercise not found"}, 404
        except ValidationError as err:
            return {"status": "error", "message": str(err.messages)}, 400
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.doc("delete_exercise")
    @jwt_required()
    @api.response(200, "Exercise disabled")
    @api.response(404, "Exercise not found")
    @api.response(500, "Internal Server Error")
    def delete(self, exercise_id: str) -> tuple[dict[str, str], int]:
        """Delete an exercise by its ID."""
        try:
            deleted = Exercise.delete_exercise(exercise_id)
            if deleted:
                return {
                    "status": "success",
                    "message": "Exercise disable",
                }, 200
            return {"status": "error", "message": "Exercise not found"}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/similar-exercises/<string:exercise_id>")
class ExerciseResourceSimilar(Resource):
    """Provides a list of similar exercises given an exercise ID."""

    @api.doc("get_similar_exercise_by_id")
    @jwt_required()
    @api.response(200, "Success")
    @api.response(404, "Exercise not found")
    @api.response(500, "Internal Server Error")
    def get(self, exercise_id: str) -> tuple[dict[str, str], int]:
        """Get a list of similar exercises by its ID."""
        try:
            exercise = Exercise.get_similar_exercises(exercise_id)
            if exercise:
                return {"status": "success", "message": exercise}, 200
            return {"status": "error", "message": "Exercise not found"}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500
