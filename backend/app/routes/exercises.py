import logging
import uuid

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from flask_restx import Api, Resource
from pydantic import ValidationError

from app.extensions import db
from app.repositories.exercise_repository import ExerciseRepository
from app.repositories.muscle_repository import (
    ensure_muscles_seeded,
    list_muscles_ordered,
    muscle_to_dict,
)
from app.schemas.exercise import ExerciseCreate, ExerciseResponse
from app.schemas.muscle import MuscleTaxonomyItem

exercises_bp = Blueprint("exercises_bp", __name__)
api = Api(exercises_bp, doc="/docs")
ResponseTuple = tuple[dict[str, object], int]


@api.route("/exercises/muscles/taxonomy")
class MuscleTaxonomyResource(Resource):
    method_decorators = [jwt_required()]

    def get(self) -> ResponseTuple:
        try:
            ensure_muscles_seeded()
            muscles = list_muscles_ordered()
            result = [
                MuscleTaxonomyItem(**muscle_to_dict(m)).model_dump(by_alias=True) for m in muscles
            ]
            return {"status": "success", "message": result}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/exercises")
class ExerciseListResource(Resource):
    method_decorators = [jwt_required()]

    def get(self) -> ResponseTuple:
        try:
            repo = ExerciseRepository()
            exercises = repo.get_active()
            result = [
                ExerciseResponse.model_validate(ex, from_attributes=True).model_dump(by_alias=True)
                for ex in exercises
            ]
            return {"status": "success", "message": result}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    def post(self) -> ResponseTuple:
        data = request.json
        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400
        try:
            schema = ExerciseCreate(**data)
            repo = ExerciseRepository()
            exercise = repo.create(**schema.model_dump())
            db.session.commit()
            return {"status": "success", "message": str(exercise.id)}, 200
        except ValidationError as err:
            return {"status": "error", "message": str(err.errors())}, 400
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/exercises/bulk")
class BulkExerciseResource(Resource):
    @jwt_required()
    def post(self) -> ResponseTuple:
        data = request.json
        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400
        try:
            validated = [ExerciseCreate(**item).model_dump() for item in data]
            repo = ExerciseRepository()
            exercises = repo.bulk_create(validated)
            db.session.commit()
            ids = [str(ex.id) for ex in exercises]
            return {"status": "success", "message": {"exercise_ids": ids}}, 201
        except ValidationError as err:
            return {"status": "error", "message": str(err.errors())}, 400
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/exercises/<string:exercise_id>")
class ExerciseResource(Resource):
    @jwt_required()
    def get(self, exercise_id: str) -> ResponseTuple:
        try:
            repo = ExerciseRepository()
            exercise = repo.get_by_id(uuid.UUID(exercise_id))
            if exercise:
                result = ExerciseResponse.model_validate(exercise, from_attributes=True).model_dump(
                    by_alias=True
                )
                return {"status": "success", "data": result}, 200
            return {"status": "error", "message": "Exercise not found"}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @jwt_required()
    def put(self, exercise_id: str) -> ResponseTuple:
        data = request.json
        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400
        try:
            schema = ExerciseCreate(**data)
            repo = ExerciseRepository()
            updated = repo.update(uuid.UUID(exercise_id), **schema.model_dump())
            db.session.commit()
            if updated:
                return {"status": "success", "message": "Exercise updated"}, 200
            return {"status": "error", "message": "Exercise not found"}, 404
        except ValidationError as err:
            return {"status": "error", "message": str(err.errors())}, 400
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @jwt_required()
    def delete(self, exercise_id: str) -> ResponseTuple:
        try:
            repo = ExerciseRepository()
            deleted = repo.soft_delete(uuid.UUID(exercise_id))
            db.session.commit()
            if deleted:
                return {"status": "success", "message": "Exercise disable"}, 200
            return {"status": "error", "message": "Exercise not found"}, 404
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/similar-exercises/<string:exercise_id>")
class ExerciseResourceSimilar(Resource):
    @jwt_required()
    def get(self, exercise_id: str) -> ResponseTuple:
        try:
            repo = ExerciseRepository()
            exercises = repo.get_similar(uuid.UUID(exercise_id))
            if exercises:
                result = [
                    ExerciseResponse.model_validate(ex, from_attributes=True).model_dump(
                        by_alias=True
                    )
                    for ex in exercises
                ]
                return {"status": "success", "message": result}, 200
            return {"status": "error", "message": "Exercise not found"}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500
