from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Api, Resource
from pydantic import ValidationError

from app.extensions import db
from app.repositories.challenge_repository import ChallengeRepository
from app.schemas.challenge import ChallengeCreate, ChallengeResponse
from app.services.user_challenge_service import UserChallengeService
from app.services.user_workout_service import UserWorkoutService

challenges_bp = Blueprint("challenges_bp", __name__)
api = Api(challenges_bp, doc="/docs")
ResponseTuple = tuple[dict[str, Any], int]


@api.route("/challenges")
class ChallengeListResource(Resource):
    def get(self) -> ResponseTuple:
        try:
            repo = ChallengeRepository()
            challenges = repo.get_active()
            result = []
            for c in challenges:
                full = repo.get_with_schedule(c.id)
                if full:
                    result.append(
                        ChallengeResponse.model_validate(full, from_attributes=True).model_dump(
                            by_alias=True
                        )
                    )
            return {"status": "success", "message": result}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    def post(self) -> ResponseTuple:
        try:
            data = request.get_json()
            if data is None:
                return {"status": "error", "message": "Body JSON requerido"}, 400

            schema = ChallengeCreate(**data)
            repo = ChallengeRepository()
            challenge_data = {
                "name": schema.name,
                "description": schema.description,
                "plan_type": schema.plan_type,
                "duration_days": schema.duration_days,
                "price": schema.price,
                "image_url": schema.image_url,
                "video_url": schema.video_url,
                "intensity": schema.intensity,
                "equipment": schema.equipment,
                "category": schema.category,
                "level": schema.level,
                "is_active": schema.is_active,
            }
            days_data = [d.model_dump() for d in schema.workout_schedule]
            challenge = repo.create_full_challenge(challenge_data, days_data)
            db.session.commit()
            return {"status": "success", "message": str(challenge.id)}, 201
        except ValidationError as err:
            return {"status": "error", "message": err.errors()}, 400
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/challenges/<string:challenge_id>")
class ChallengeResource(Resource):
    def get(self, challenge_id: str) -> ResponseTuple:
        try:
            repo = ChallengeRepository()
            challenge = repo.get_with_schedule(uuid.UUID(challenge_id))
            if challenge:
                result = ChallengeResponse.model_validate(
                    challenge, from_attributes=True
                ).model_dump(by_alias=True)
                return {"status": "success", "message": result}, 200
            return {"status": "error", "message": "Challenge not found"}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    def put(self, challenge_id: str) -> ResponseTuple:
        try:
            data = request.get_json()
            if data is None:
                return {"status": "error", "message": "Body JSON requerido"}, 400

            schema = ChallengeCreate(**data)
            repo = ChallengeRepository()
            ch_uuid = uuid.UUID(challenge_id)
            updated = repo.update(
                ch_uuid,
                name=schema.name,
                description=schema.description,
                duration_days=schema.duration_days,
                price=schema.price,
                image_url=schema.image_url,
                video_url=schema.video_url,
                intensity=schema.intensity,
                equipment=schema.equipment,
                category=schema.category,
                level=schema.level,
                is_active=schema.is_active,
            )
            if not updated:
                return {"status": "error", "message": "Challenge not found"}, 404

            if schema.workout_schedule:
                days_data = [d.model_dump() for d in schema.workout_schedule]
                repo.replace_schedule(ch_uuid, days_data)

            db.session.commit()
            return {"status": "success", "message": "Challenge updated"}, 200
        except ValidationError as err:
            return {"status": "error", "message": err.errors()}, 400
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    def delete(self, challenge_id: str) -> ResponseTuple:
        try:
            repo = ChallengeRepository()
            deleted = repo.soft_delete(uuid.UUID(challenge_id))
            db.session.commit()
            if deleted:
                return {"status": "success", "message": "Challenge deleted"}, 200
            return {"status": "error", "message": "Challenge not found"}, 404
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/challenges/progress")
class UserChallengeProgressResource(Resource):
    @jwt_required()
    def get(self) -> ResponseTuple:
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
            logging.exception(f"Error getting challenge progress: {e}")
            return {"status": "error", "message": "Internal server error"}, 500

    @jwt_required()
    def post(self) -> ResponseTuple:
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
            db.session.commit()
            return {"status": "success", "message": "Progreso guardado"}, 200
        except Exception as e:
            db.session.rollback()
            logging.exception(f"Error saving challenge progress: {e}")
            return {"status": "error", "message": "Internal server error"}, 500


@api.route("/challenges/complete")
class CompleteChallengeResource(Resource):
    @jwt_required()
    def post(self) -> ResponseTuple:
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
            db.session.commit()
            return {"status": "success", "message": "Challenge completado guardado"}, 200
        except Exception as e:
            db.session.rollback()
            logging.exception(f"Error saving completed challenge: {e}")
            return {"status": "error", "message": "Internal server error"}, 500
