from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Api, Resource, fields
from marshmallow import ValidationError
from app.models.workouts import WorkoutPlan
from app.models.user import User
from app.Schemas.WorkoutSchema import workout_plan_schema, workout_plans_schema
import logging

from app.services.user_workout_service import UserWorkoutService

workouts_bp = Blueprint("workouts_bp", __name__)
api = Api(workouts_bp, doc="/docs")

exercise_model = api.model(
    "Exercise",
    {
        "exercise_id": fields.String(required=True, description="ID of the exercise"),
        "sets": fields.Integer(required=True, description="Number of sets"),
        "reps": fields.Integer(required=True, description="Number of repetitions"),
        "rest_seconds": fields.Integer(required=True, description="Rest time in seconds"),
    },
)
workout_schedule_model = api.model(
    "WorkoutSchedule",
    {
        "day_of_week": fields.String(description="Day of the week"),
        "sequence_day": fields.Integer(description="Sequence day for challenges"),
        "exercises": fields.List(
            fields.Nested(exercise_model),
            required=True,
            description="List of exercises",
        ),
    },
)
workout_plan_model = api.model(
    "WorkoutPlan",
    {
        "name": fields.String(required=True, description="Workout plan name"),
        "description": fields.String(description="Workout plan description"),
        "plan_type": fields.String(
            required=True,
            description="Type of workout plan",
            enum=["library", "paid", "personalized", "challenge"],
        ),
        "duration_weeks": fields.Integer(description="Duration of the plan in weeks"),
        "price": fields.Float(description="Price of the plan (for paid plans)"),
        "image_url": fields.String(description="URL of the workout plan image"),
        "video_url": fields.String(description="URL of the workout plan video"),
        "workout_schedule": fields.List(
            fields.Nested(workout_schedule_model),
            required=True,
            description="Workout schedule",
        ),
        "level": fields.String(
            default="beginner",
            description="Level of difficulty",
            enum=["beginner", "intermediate", "advanced"],
        ),
    },
)

save_workouts_model = api.model(
    "SaveWorkouts",
    {"workouts": fields.List(fields.String, required=True, description="List of workout IDs")},
)

response_model = api.model(
    "ErrorModel",
    {
        "status": fields.String(description="Status of the request"),
        "message": fields.String(description="Error message or data"),
    },
)


@api.route("/plans")
class WorkoutPlanListResource(Resource):
    method_decorators = [jwt_required()]

    @api.expect(workout_plan_model)
    @api.doc("create_workout_plan")
    @api.response(201, "Workout Plan created")
    @api.response(400, "Validation Error")
    @api.response(500, "Internal Server Error")
    def post(self):
        """Create a new workout plan."""
        data = request.json
        try:
            validated_data = workout_plan_schema.load(data)
            workout_plan_id = WorkoutPlan.create_workout_plan(validated_data)
            return {"status": "success", "message": str(workout_plan_id)}, 201
        except ValidationError as err:
            return {"status": "error", "message": err.messages}, 400
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.doc("get_workout_plans")
    @api.response(200, "Success")
    @api.response(500, "Internal Server Error")
    def get(self):
        """Get a workout plan list."""
        try:
            plans = WorkoutPlan.get_workout_plans()
            return {"status": "success", "message": plans}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/plans/one-day")
class OneDayWorkoutPlanListResource(Resource):
    @api.doc("get_one_day_workout_plans")
    @jwt_required()
    @api.response(200, "Success")
    @api.response(500, "Internal Server Error")
    def get(self):
        """Retrieve workout plans that are for one day only."""
        try:
            plans = WorkoutPlan.get_one_day_workouts()
            return {"status": "success", "message": plans}, 200
        except Exception as e:
            logging.exception("Failed to retrieve one-day workout plans.")
            return {"status": "error", "message": str(e)}, 500


@api.route("/plans/bulk")
class BulkWorkoutPlanResource(Resource):
    @api.doc("create_bulk_workout_plans")
    @jwt_required()
    @api.expect([workout_plan_model])
    @api.response(201, "Workout Plans created")
    @api.response(400, "Validation Error")
    @api.response(500, "Internal Server Error")
    def post(self):
        """Create multiple workout plans in bulk."""
        data = request.json
        try:
            validated_data = workout_plans_schema.load(data, many=True)
            workout_plan_ids = WorkoutPlan.create_bulk_workout_plans(validated_data)

            logging.info(f"Successfully created the workout plans: {workout_plan_ids}")
            return {
                "status": "success",
                "message": {"workout_plan_ids": workout_plan_ids},
            }, 201
        except ValidationError as err:
            logging.exception(f"Failed to bulk create the workout plans | {err}")
            return {"status": "error", "message": err.messages}, 400
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/plans/<string:plan_id>")
class WorkoutPlanResource(Resource):
    method_decorators = [jwt_required()]

    @api.doc("get_workout_plan_by_id")
    @api.response(200, "Success")
    @api.response(404, "Workout Plan not found")
    @api.response(500, "Internal Server Error")
    def get(self, plan_id):
        """Get a workout plan by its ID."""
        try:
            workout_plan = WorkoutPlan.get_workout_plan_by_id(plan_id)
            if workout_plan:
                return {"status": "success", "message": workout_plan}, 200
            return {
                "status": "error",
                "message": "Workout Plan not found",
            }, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.doc("update_workout_plan")
    @api.expect(workout_plan_model)
    @api.response(200, "Workout Plan updated")
    @api.response(400, "Validation Error")
    @api.response(404, "Workout Plan not found")
    @api.response(500, "Internal Server Error")
    def put(self, plan_id):
        """Update a workout plan by its ID."""
        data = request.json
        try:
            validated_data = workout_plan_schema.load(data)
            updated = WorkoutPlan.update_workout_plan(plan_id, validated_data)

            if updated:
                return {
                    "status": "success",
                    "message": "Workout Plan updated",
                }, 200
            return {
                "status": "error",
                "message": "Workout Plan not found",
            }, 404
        except ValidationError as err:
            return {"status": "error", "message": err.messages}, 400
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.doc("delete_workout_plan")
    @api.response(200, "Workout Plan disabled")
    @api.response(404, "Workout Plan not found")
    @api.response(500, "Internal Server Error")
    def delete(self, plan_id):
        """Delete a workout plan by its ID."""
        try:
            deleted = WorkoutPlan.delete_workout_plan(plan_id)
            if deleted:
                return {
                    "status": "success",
                    "message": "Workout Plan disabled",
                }, 200
            return {
                "status": "error",
                "message": "Workout Plan not found",
            }, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/saved")
class UserWorkoutSavedResource(Resource):
    method_decorators = [jwt_required()]

    @api.doc("get_saved_workouts_by_user_id")
    @api.response(200, "Success")
    @api.response(404, "Workout Plans not found")
    @api.response(500, "Internal Server Error")
    def get(self):
        """Get a workout plan saved by user ID."""
        try:
            user_id = get_jwt_identity()
            workout_plan = User.get_saved_workouts(user_id)

            print(workout_plan)
            print("HDJADAJDADJ")

            return {"status": "success", "message": workout_plan}, 200
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.doc("save_workout_by_user_id")
    @api.param("workout_id", "ID of the workout", required=True)
    @api.response(200, "Success")
    @api.response(400, "Value error")
    @api.response(500, "Internal Server Error")
    def post(self):
        """Save workouts for the users by id"""
        try:
            workout_id = request.args.get("workout_id")

            if not workout_id:
                return {
                    "status": "error",
                    "message": "Missing required parameter: workout_id",
                }, 400

            user_id = get_jwt_identity()
            success = User.add_saved_workout(user_id, [workout_id])

            if success:
                return {
                    "status": "success",
                    "message": f"Workouts saved for the user {user_id}!",
                }, 200
            return {"status": "error", "message": "Error saving workouts"}, 400
        except ValueError as ve:
            logging.exception(str(ve))
            return {"status": "error", "message": str(ve)}, 400
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500

    @api.doc("delete_saved_workout_by_user_id")
    @api.param("workout_id", "ID of the workout", required=True)
    @api.response(200, "Success")
    @api.response(400, "Error in request")
    @api.response(500, "Internal Server Error")
    def delete(self):
        """Delete saved workouts for a user."""
        try:
            workout_id = request.args.get("workout_id")

            if not workout_id:
                return {
                    "status": "error",
                    "message": "Missing required parameter: workout_id",
                }, 400

            user_id = get_jwt_identity()
            deleted = User.delete_saved_workout(user_id, workout_id)

            if deleted:
                return {
                    "status": "success",
                    "message": "Workout deleted!",
                }, 200
            return {
                "status": "error",
                "message": "There was an error removing the saved workout!",
            }, 400
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/library")
class LibraryResource(Resource):
    @api.doc("get_workout_plans_with_exercise_count")
    @jwt_required()
    @api.response(200, "Success")
    @api.response(404, "No workout plans found")
    @api.response(500, "Internal Server Error")
    def get(self):
        """Fetch workout plans with the exercise count."""
        try:
            workout_plans = WorkoutPlan.get_workout_plans_with_exercise_count()
            if not workout_plans:
                return {
                    "status": "error",
                    "message": "No workout plans found",
                }, 404
            return {"status": "success", "message": workout_plans}, 200
        except ValueError as ve:
            logging.exception(str(ve))
            return {"status": "error", "message": str(ve)}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/library/muscle_group/<string:muscle_group>")
class LibraryMuscleResource(Resource):
    @api.doc("get_workout_plans_by_muscle_group")
    @jwt_required()
    @api.response(200, "Success")
    @api.response(404, "No workout plans found for the specified muscle group")
    @api.response(500, "Internal Server Error")
    def get(self, muscle_group):
        """Fetch workout plans by muscle group."""
        try:
            workout_plans = WorkoutPlan.get_workout_plans_by_muscle_group(muscle_group)
            if not workout_plans:
                return {
                    "status": "error",
                    "message": "No workout plans found",
                }, 404
            return {"status": "success", "message": workout_plans}, 200
        except ValueError as ve:
            logging.exception(str(ve))
            return {"status": "error", "message": str(ve)}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/library/difficulty/<string:difficulty>")
class WorkoutPlanByDifficultyResource(Resource):
    @api.doc("get_workout_plans_by_difficulty")
    @jwt_required()
    @api.response(200, "Success")
    @api.response(404, "No workout plans found for the specified difficulty")
    @api.response(500, "Internal Server Error")
    def get(self, difficulty):
        """Fetch workout plans by difficulty level."""
        try:
            workout_plans = WorkoutPlan.get_workout_plans_by_difficulty(difficulty)
            if not workout_plans:
                return {
                    "status": "error",
                    "message": "No workout plans found",
                }, 404
            return {"status": "success", "message": workout_plans}, 200
        except ValueError as ve:
            logging.exception(str(ve))
            return {"status": "error", "message": str(ve)}, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/weekly-progress")
class WeeklyWorkoutProgressResource(Resource):
    @jwt_required()
    @api.response(200, "Weekly workout progress retrieved successfully")
    @api.response(400, "Invalid input", response_model)
    @api.response(500, "Internal server error", response_model)
    def get(self):
        """
        Get the user's workout progress for the current week.
        """
        try:
            user_id = get_jwt_identity()
            progress = UserWorkoutService.get_weekly_workout_progress(user_id)
            return {"status": "success", "message": progress}, 200

        except Exception as e:
            logging.exception(f"Error retrieving weekly workout progress: {e}")
            return {"status": "error", "message": e}, 500


@api.route("/challenge-progress")
class ChallengeProgressResource(Resource):
    @api.param("challenge_id", "ID of the challenge", required=True)
    @jwt_required()
    @api.response(200, "Challenge progress retrieved successfully")
    @api.response(400, "Invalid input", response_model)
    @api.response(500, "Internal server error", response_model)
    def get(self):
        """
        Get the user's progress for a specific challenge.
        """
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
    @api.response(200, "Popular workout retrieved successfully")
    @api.response(500, "Internal server error", response_model)
    def get(self):
        """Get the user's prefered workout."""
        try:
            workouts = WorkoutPlan.get_popular_workouts()
            print(workouts)
            return {"status": "success", "message": workouts}, 200
        except Exception as e:
            logging.exception(f"Error retrieving popular workouts: {e}")
            return {"status": "error", "message": "Internal server error"}, 500


@api.route("/plans/<string:plan_id>/delete-exercises")
class DeleteExercisesResource(Resource):
    @jwt_required()
    @api.response(200, "Workout Plan updated")
    @api.response(404, "Workout Plan not found")
    @api.response(500, "Internal Server Error")
    def put(self, plan_id):
        data = request.json
        try:
            updated = WorkoutPlan.delete_exercises(plan_id, data)
            if updated:
                return {
                    "status": "success",
                    "message": "Exercises deleted successfully",
                }, 200

            return {
                "status": "error",
                "message": "Workout Plan not found or no exercises deleted",
            }, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500


@api.route("/plans/<string:plan_id>/update-exercises")
class UpdateExercisesResource(Resource):
    @jwt_required()
    @api.response(200, "Workout Plan updated")
    @api.response(404, "Workout Plan not found")
    @api.response(500, "Internal Server Error")
    def put(self, plan_id):
        data = request.json
        try:
            updated = WorkoutPlan.update_exercise_ids(plan_id, data)
            if updated:
                return {
                    "status": "success",
                    "message": "Exercises updated successfully",
                }, 200

            return {
                "status": "error",
                "message": "Workout Plan not found or no exercises updated",
            }, 404
        except Exception as e:
            logging.exception(str(e))
            return {"status": "error", "message": str(e)}, 500
