from __future__ import annotations

import logging
import uuid
from typing import Any

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Api, Resource
from pydantic import ValidationError

from app.extensions import db
from app.repositories.progress_repository import SavedWorkoutRepository
from app.repositories.workout_repository import WorkoutPlanRepository
from app.schemas.workout import WorkoutPlanCreate, WorkoutPlanResponse
from app.services.user_workout_service import UserWorkoutService

workouts_bp = Blueprint("workouts_bp", __name__)
api = Api(workouts_bp, doc="/docs")


@api.route("/plans")
class WorkoutPlanListResource(Resource):
    method_decorators = [jwt_required()]

    def post(self) -> tuple[dict[str, Any], int]:
        data = request.json
        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400
        try:
            schema = WorkoutPlanCreate(**data)
            repo = WorkoutPlanRepository()
            plan_data = {
                "name": schema.name,
                "description": schema.description,
                "plan_type": schema.plan_type,
                "duration_weeks": schema.duration_weeks,
                "price": schema.price,
                "image_url": schema.image_url,
                "video_url": schema.video_url,
                "level": schema.level,
            }
            days_data = [d.model_dump() for d in schema.workout_schedule]
            plan = repo.create_full_plan(plan_data, days_data)
            db.session.commit()
            return {"status": "success", "message": str(plan.id)}, 201
        except ValidationError as err:
            return {"status": "error", "message": err.errors()}, 400
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    def get(self) -> tuple[dict[str, Any], int]:
        try:
            repo = WorkoutPlanRepository()
            plans = repo.get_active_plans()
            result = [
                WorkoutPlanResponse.model_validate(p, from_attributes=True).model_dump(
                    by_alias=True
                )
                for p in plans
            ]
            return {"status": "success", "message": result}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/plans/one-day")
class OneDayWorkoutPlanListResource(Resource):
    @jwt_required()
    def get(self) -> tuple[dict[str, Any], int]:
        try:
            repo = WorkoutPlanRepository()
            plans = repo.get_one_day_plans()
            result = [
                WorkoutPlanResponse.model_validate(p, from_attributes=True).model_dump(
                    by_alias=True
                )
                for p in plans
            ]
            return {"status": "success", "message": result}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/plans/bulk")
class BulkWorkoutPlanResource(Resource):
    @jwt_required()
    def post(self) -> tuple[dict[str, Any], int]:
        data = request.json
        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400
        try:
            repo = WorkoutPlanRepository()
            ids = []
            for item in data:
                schema = WorkoutPlanCreate(**item)
                plan_data = {
                    "name": schema.name,
                    "description": schema.description,
                    "plan_type": schema.plan_type,
                    "duration_weeks": schema.duration_weeks,
                    "price": schema.price,
                    "image_url": schema.image_url,
                    "video_url": schema.video_url,
                    "level": schema.level,
                }
                days = [d.model_dump() for d in schema.workout_schedule]
                plan = repo.create_full_plan(plan_data, days)
                ids.append(str(plan.id))
            db.session.commit()
            return {"status": "success", "message": {"workout_plan_ids": ids}}, 201
        except ValidationError as err:
            return {"status": "error", "message": err.errors()}, 400
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/plans/<string:plan_id>")
class WorkoutPlanResource(Resource):
    method_decorators = [jwt_required()]

    def get(self, plan_id: str) -> tuple[dict[str, Any], int]:
        try:
            repo = WorkoutPlanRepository()
            plan = repo.get_with_schedule(uuid.UUID(plan_id))
            if plan:
                result = WorkoutPlanResponse.model_validate(plan, from_attributes=True).model_dump(
                    by_alias=True
                )
                return {"status": "success", "message": result}, 200
            return {"status": "error", "message": "Workout Plan not found"}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    def put(self, plan_id: str) -> tuple[dict[str, Any], int]:
        data = request.json
        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400
        try:
            schema = WorkoutPlanCreate(**data)
            repo = WorkoutPlanRepository()
            plan_uuid = uuid.UUID(plan_id)
            updated = repo.update(
                plan_uuid,
                name=schema.name,
                description=schema.description,
                plan_type=schema.plan_type,
                duration_weeks=schema.duration_weeks,
                price=schema.price,
                image_url=schema.image_url,
                video_url=schema.video_url,
                level=schema.level,
            )
            if not updated:
                return {"status": "error", "message": "Workout Plan not found"}, 404

            if schema.workout_schedule:
                days_data = [d.model_dump() for d in schema.workout_schedule]
                repo.replace_schedule(plan_uuid, days_data)

            db.session.commit()
            return {"status": "success", "message": "Workout Plan updated"}, 200
        except ValidationError as err:
            return {"status": "error", "message": err.errors()}, 400
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    def delete(self, plan_id: str) -> tuple[dict[str, Any], int]:
        try:
            repo = WorkoutPlanRepository()
            deleted = repo.soft_delete(uuid.UUID(plan_id))
            db.session.commit()
            if deleted:
                return {"status": "success", "message": "Workout Plan disabled"}, 200
            return {"status": "error", "message": "Workout Plan not found"}, 404
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/saved")
class UserWorkoutSavedResource(Resource):
    method_decorators = [jwt_required()]

    def get(self) -> tuple[dict[str, Any], int]:
        try:
            user_id = get_jwt_identity()
            repo = SavedWorkoutRepository()
            saved = repo.get_by_user(uuid.UUID(user_id))
            result = [
                WorkoutPlanResponse.model_validate(
                    sw.workout_plan, from_attributes=True
                ).model_dump(by_alias=True)
                for sw in saved
                if sw.workout_plan and sw.workout_plan.is_active
            ]
            return {"status": "success", "message": result}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    def post(self) -> tuple[dict[str, Any], int]:
        try:
            workout_id = request.args.get("workout_id")
            if not workout_id:
                return {"status": "error", "message": "Missing required parameter: workout_id"}, 400
            user_id = get_jwt_identity()
            repo = SavedWorkoutRepository()
            repo.add(uuid.UUID(user_id), uuid.UUID(workout_id))
            db.session.commit()
            return {"status": "success", "message": f"Workouts saved for the user {user_id}!"}, 200
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    def delete(self) -> tuple[dict[str, Any], int]:
        try:
            workout_id = request.args.get("workout_id")
            if not workout_id:
                return {"status": "error", "message": "Missing required parameter: workout_id"}, 400
            user_id = get_jwt_identity()
            repo = SavedWorkoutRepository()
            deleted = repo.remove(uuid.UUID(user_id), uuid.UUID(workout_id))
            db.session.commit()
            if deleted:
                return {"status": "success", "message": "Workout deleted!"}, 200
            return {
                "status": "error",
                "message": "There was an error removing the saved workout!",
            }, 400
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/library")
class LibraryResource(Resource):
    @jwt_required()
    def get(self) -> tuple[dict[str, Any], int]:
        try:
            repo = WorkoutPlanRepository()
            plans = repo.get_library_with_exercise_count()
            if not plans:
                return {"status": "error", "message": "No workout plans found"}, 404
            return {"status": "success", "message": plans}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/library/muscle_group/<string:muscle_group>")
class LibraryMuscleResource(Resource):
    @jwt_required()
    def get(self, muscle_group: str) -> tuple[dict[str, Any], int]:
        try:
            repo = WorkoutPlanRepository()
            plans = repo.get_active_plans()
            result = [
                WorkoutPlanResponse.model_validate(p, from_attributes=True).model_dump(
                    by_alias=True
                )
                for p in plans
            ]
            if not result:
                return {"status": "error", "message": "No workout plans found"}, 404
            return {"status": "success", "message": result}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/library/difficulty/<string:difficulty>")
class WorkoutPlanByDifficultyResource(Resource):
    @jwt_required()
    def get(self, difficulty: str) -> tuple[dict[str, Any], int]:
        try:
            repo = WorkoutPlanRepository()
            plans = repo.get_by_difficulty(difficulty)
            if not plans:
                return {"status": "error", "message": "No workout plans found"}, 404
            result = [
                WorkoutPlanResponse.model_validate(p, from_attributes=True).model_dump(
                    by_alias=True
                )
                for p in plans
            ]
            return {"status": "success", "message": result}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/weekly-progress")
class WeeklyWorkoutProgressResource(Resource):
    @jwt_required()
    def get(self) -> tuple[dict[str, Any], int]:
        try:
            user_id = get_jwt_identity()
            progress = UserWorkoutService.get_weekly_workout_progress(user_id)
            return {"status": "success", "message": progress}, 200
        except Exception as e:
            logging.exception(f"Error retrieving weekly workout progress: {e}")
            return {"status": "error", "message": str(e)}, 500


@api.route("/challenge-progress")
class ChallengeProgressResource(Resource):
    @jwt_required()
    def get(self) -> tuple[dict[str, Any], int]:
        try:
            user_id = get_jwt_identity()
            challenge_id = request.args.get("challenge_id")
            if not challenge_id:
                return {
                    "status": "error",
                    "message": "Missing required parameter: challenge_id",
                }, 400
            progress = UserWorkoutService.get_challenge_progress(user_id, challenge_id)
            return {"status": "success", "message": progress}, 200
        except Exception as e:
            logging.exception(f"Error retrieving challenge progress: {e}")
            return {"status": "error", "message": "Internal server error"}, 500


@api.route("/popular")
class PopularWorkoutsResource(Resource):
    @jwt_required()
    def get(self) -> tuple[dict[str, Any], int]:
        try:
            from sqlalchemy import func, select

            from app.models.progress import CompletedWorkout

            stmt = (
                select(
                    CompletedWorkout.workout_plan_id,
                    func.count(CompletedWorkout.id).label("total"),
                )
                .where(CompletedWorkout.workout_plan_id.isnot(None))
                .group_by(CompletedWorkout.workout_plan_id)
                .order_by(func.count(CompletedWorkout.id).desc())
                .limit(5)
            )
            rows = db.session.execute(stmt).all()

            result = []
            repo = WorkoutPlanRepository()
            for row in rows:
                plan = repo.get_with_schedule(row.workout_plan_id)
                if plan and plan.plan_type != "personalized":
                    ex_count = sum(len(d.exercises) for d in plan.workout_days)
                    result.append(
                        {
                            "id": str(plan.id),
                            "title": plan.name,
                            "image": plan.image_url,
                            "workoutCount": ex_count,
                        }
                    )

            return {"status": "success", "message": result}, 200
        except Exception as e:
            logging.exception(f"Error retrieving popular workouts: {e}")
            return {"status": "error", "message": "Internal server error"}, 500


@api.route("/plans/<string:plan_id>/delete-exercises")
class DeleteExercisesResource(Resource):
    @jwt_required()
    def put(self, plan_id: str) -> tuple[dict[str, Any], int]:
        data = request.json
        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400
        try:
            repo = WorkoutPlanRepository()
            plan = repo.get_with_schedule(uuid.UUID(plan_id))
            if not plan:
                return {"status": "error", "message": "Workout Plan not found"}, 404

            for day in plan.workout_days:
                day_key = (day.day_of_week or "").lower()
                if day_key in data:
                    ids_to_remove = set(data[day_key])
                    for wde in list(day.exercises):
                        if str(wde.exercise_id) in ids_to_remove:
                            db.session.delete(wde)

            db.session.commit()
            return {"status": "success", "message": "Exercises deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/plans/<string:plan_id>/update-exercises")
class UpdateExercisesResource(Resource):
    @jwt_required()
    def put(self, plan_id: str) -> tuple[dict[str, Any], int]:
        data = request.json
        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400
        try:
            repo = WorkoutPlanRepository()
            plan = repo.get_with_schedule(uuid.UUID(plan_id))
            if not plan:
                return {"status": "error", "message": "Workout Plan not found"}, 404

            for day in plan.workout_days:
                day_key = (day.day_of_week or "").lower()
                if day_key in data:
                    for wde in day.exercises:
                        for replacement in data[day_key]:
                            if str(wde.exercise_id) == replacement.get("old_exercise_id"):
                                wde.exercise_id = uuid.UUID(replacement["new_exercise"])

            db.session.commit()
            return {"status": "success", "message": "Exercises updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500
