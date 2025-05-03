from __future__ import annotations

from app.Schemas.WorkoutSchema import workout_plan_schema, workout_plans_schema
from app.Schemas.ExerciseSchema import exercise_schema
from app.extensions import mongo
from bson.objectid import ObjectId
from datetime import datetime
from marshmallow import ValidationError
from typing import Optional, Any

import re


class WorkoutPlan:
    """CRUD operations for Workout Plans."""

    @staticmethod
    def get_workout_plans() -> list[dict[str, Any]]:
        """Return the list of workout plans that exists"""
        try:
            result = mongo.db.workout_plans.find(
                {"is_active": True, "plan_type": {"$ne": "personalized"}}
            )
            return workout_plans_schema.dump(result)  # type: ignore[no-any-return]
        except Exception as e:
            raise Exception(f"Error retrieving workout plans: {str(e)}")

    @staticmethod
    def get_one_day_workouts() -> list[dict[str, Any]]:
        """Return workout plans that are for one day only."""
        try:
            result = mongo.db.workout_plans.find(
                {
                    "workout_schedule": {"$size": 1},
                    "workout_schedule.day_of_week": {"$exists": False},
                    "workout_schedule.sequence_day": {"$exists": False},
                }
            )

            return workout_plans_schema.dump(result)  # type: ignore[no-any-return]
        except Exception as e:
            raise Exception(f"Error retrieving one-day workout plans: {str(e)}")

    @staticmethod
    def get_routines() -> list[dict[str, Any]]:
        """Return workout plans that are routines (weekly)."""
        try:
            result = mongo.db.workout_plans.find(
                {
                    "workout_schedule.day_of_week": {"$exists": True},
                    "workout_schedule.sequence_day": {"$exists": False},
                }
            )
            return workout_plans_schema.dump(result)  # type: ignore[no-any-return]
        except Exception as e:
            raise Exception(f"Error retrieving routines: {str(e)}")

    @staticmethod
    def get_challenges() -> list[dict[str, Any]]:
        """Return workout plans that are challenges (sequence-based)."""
        try:
            result = mongo.db.workout_plans.find(
                {
                    "workout_schedule.sequence_day": {"$exists": True},
                    "workout_schedule.day_of_week": {"$exists": False},
                }
            )
            return workout_plans_schema.dump(result)  # type: ignore[no-any-return]
        except Exception as e:
            raise Exception(f"Error retrieving challenges: {str(e)}")

    @staticmethod
    def create_workout_plan(data: dict[str, Any]) -> str:
        """Create a new workout plan in MongoDB with timestamps."""
        try:
            validated_data = workout_plan_schema.load(data)
            validated_data["created_at"] = datetime.now()
            validated_data["updated_at"] = datetime.now()

            for day in validated_data.get("workout_schedule", []):
                for exercise in day.get("exercises", []):
                    if not WorkoutPlan.exercise_exists(exercise["exercise_id"]):
                        raise ValueError(f"Exercise ID {exercise['exercise_id']} does not exist.")

            result = mongo.db.workout_plans.insert_one(validated_data)
            return str(result.inserted_id)
        except ValidationError as e:
            raise ValueError(f"Invalid data: {e.messages}")
        except Exception as e:
            raise Exception(f"Error creating workout plan: {str(e)}")

    @staticmethod
    def create_bulk_workout_plans(data_list: list[dict[str, Any]]) -> list[str]:
        """Create multiple workout plans in MongoDB."""
        try:
            workout_plan_ids = []
            for data in data_list:
                validated_data = workout_plan_schema.load(data)
                validated_data["created_at"] = datetime.now()
                validated_data["updated_at"] = datetime.now()

                for day in validated_data.get("workout_schedule", []):
                    for exercise in day.get("exercises", []):
                        if not WorkoutPlan.exercise_exists(exercise["exercise_id"]):
                            raise ValueError(
                                f"Exercise ID {exercise['exercise_id']} does not exist."
                            )

                result = mongo.db.workout_plans.insert_one(validated_data)
                workout_plan_ids.append(str(result.inserted_id))
            return workout_plan_ids
        except ValidationError as e:
            raise ValueError(f"Invalid data: {e.messages}")
        except Exception as e:
            raise Exception(f"Error creating bulk workout plans: {str(e)}")

    @staticmethod
    def get_workout_plan_by_id(plan_id: str) -> Optional[dict[str, Any]]:
        """Fetch a workout plan by its ID."""
        try:
            workout_plan = mongo.db.workout_plans.find_one({"_id": ObjectId(plan_id)})
            workout_plan = workout_plan_schema.dump(workout_plan)

            if workout_plan:
                exercise_ids = set()
                for day in workout_plan["workout_schedule"]:
                    for ex in day["exercises"]:
                        exercise_id = ex.get("exercise_id") or ex.get("exerciseId")
                        if exercise_id:
                            exercise_ids.add(ObjectId(exercise_id))

                if not exercise_ids:
                    return workout_plan  # type: ignore[no-any-return]

                exercises = list(mongo.db.exercise.find({"_id": {"$in": list(exercise_ids)}}))
                exercise_map = {str(ex["_id"]): exercise_schema.dump(ex) for ex in exercises}

                for day in workout_plan["workout_schedule"]:
                    updated_exercises = []
                    for ex in day["exercises"]:
                        exercise_id = ex.get("exercise_id") or ex.get("exerciseId")
                        if exercise_id and exercise_id in exercise_map:
                            ex["description"] = exercise_map[exercise_id]["description"]
                            ex["name"] = exercise_map[exercise_id]["name"]
                            ex["image_url"] = exercise_map[exercise_id]["image_url"]
                            ex["video_url"] = exercise_map[exercise_id]["video_url"]
                            ex["difficulty"] = exercise_map[exercise_id]["difficulty"]
                            ex["category"] = exercise_map[exercise_id]["category"]
                            ex["muscle_group"] = exercise_map[exercise_id]["muscle_group"]
                            ex["equipment"] = exercise_map[exercise_id]["equipment"]
                            updated_exercises.append(ex)
                    day["exercises"] = updated_exercises

                return workout_plan  # type: ignore[no-any-return]
            return None
        except Exception as e:
            raise Exception(f"Error retrieving workout plan: {str(e)}")

    @staticmethod
    def update_workout_plan(plan_id: str, data: dict[str, Any]) -> bool:
        """Update a workout plan by its ID and update the updated_at timestamp."""
        try:
            validated_data = workout_plan_schema.load(data)
            validated_data["updated_at"] = datetime.now()

            for day in validated_data.get("workout_schedule", []):
                for exercise in day.get("exercises", []):
                    if not WorkoutPlan.exercise_exists(exercise["exercise_id"]):
                        raise ValueError(f"Exercise ID {exercise['exercise_id']} does not exist.")

            result = mongo.db.workout_plans.update_one(
                {"_id": ObjectId(plan_id)}, {"$set": validated_data}
            )
            return bool(result.modified_count > 0)
        except ValidationError as e:
            raise ValueError(f"Invalid data: {e.messages}")
        except Exception as e:
            raise Exception(f"Error updating workout plan: {str(e)}")

    @staticmethod
    def delete_workout_plan(plan_id: str) -> bool:
        """Disable a workout plan by its ID and update the updated_at timestamp."""
        try:
            result = mongo.db.workout_plans.update_one(
                {"_id": ObjectId(plan_id)},
                {"$set": {"is_active": False, "updated_at": datetime.now()}},
            )
            return bool(result.modified_count > 0)
        except Exception as e:
            raise Exception(f"Error updating workout plan: {str(e)}")

    @staticmethod
    def exercise_exists(exercise_id: str) -> bool:
        """Check if an exercise ID exists in the database."""
        exercise = mongo.db.exercise.find_one({"_id": ObjectId(exercise_id)})
        return exercise is not None

    @staticmethod
    def get_workout_plans_by_muscle_group(muscle_group: str) -> Optional[list[dict[str, Any]]]:
        """Retrieve workout plans by muscle group."""
        try:
            plans = list(
                mongo.db.workout_plans.find(
                    {
                        "workout_schedule.exercises.muscle_group": re.compile(
                            "^" + re.escape(muscle_group) + "$", re.IGNORECASE
                        )
                    }
                )
            )
            if not plans:
                raise ValueError("No workout plans found for the specified muscle group")
            return workout_plans_schema.dump(plans)  # type: ignore[no-any-return]
        except Exception as e:
            raise RuntimeError(f"Error fetching workout plans by muscle group: {e}")

    @staticmethod
    def get_workout_plans_by_difficulty(difficulty: str) -> Optional[list[dict[str, Any]]]:
        """Retrieve workout plans by difficulty level."""
        try:
            plans = list(
                mongo.db.workout_plans.find(
                    {"level": re.compile("^" + re.escape(difficulty) + "$", re.IGNORECASE)}
                )
            )
            if not plans:
                raise ValueError("No workout plans found for the specified difficulty level")
            return workout_plans_schema.dump(plans)  # type: ignore[no-any-return]
        except Exception as e:
            raise RuntimeError(f"Error fetching workout plans by difficulty: {e}")

    @staticmethod
    def get_workout_plans_with_exercise_count() -> list[dict[str, Any]]:
        """
        Retrieve all workout plans with their title,
        description, image, and total exercise count.
        """
        try:
            pipeline = [
                {
                    "$match": {
                        "is_active": True,
                        "plan_type": {"$ne": "personalized"},
                    }
                },
                {
                    "$project": {
                        "title": "$name",
                        "description": 1,
                        "image": "$image_url",
                        "workout_schedule": 1,
                    }
                },
                {"$unwind": "$workout_schedule"},
                {"$unwind": "$workout_schedule.exercises"},
                {
                    "$group": {
                        "_id": "$_id",
                        "title": {"$first": "$title"},
                        "description": {"$first": "$description"},
                        "image": {"$first": "$image"},
                        "workoutCount": {"$sum": 1},
                    }
                },
            ]

            plans = list(mongo.db.workout_plans.aggregate(pipeline))

            if not plans:
                raise ValueError("No workout plans found")

            result = []
            for plan in plans:
                plan_data = {
                    "title": plan.get("title", ""),
                    "description": plan.get("description", ""),
                    "image": plan.get("image", ""),
                    "workoutCount": plan.get("workoutCount", 0),
                }
                result.append(plan_data)

            return result

        except Exception as e:
            raise RuntimeError(f"Error fetching workout plans: {e}")

    from bson import ObjectId

    @staticmethod
    def get_popular_workouts() -> list[dict[str, Any]]:
        try:
            pipeline = [
                {"$unwind": "$workout_history.completed_workouts"},
                {
                    "$group": {
                        "_id": "$workout_history.completed_workouts.workout_id",
                        "total_completed": {"$sum": 1},
                    }
                },
                {"$sort": {"total_completed": -1}},
                {"$limit": 5},
                {"$addFields": {"_id": {"$toObjectId": "$_id"}}},
                {
                    "$lookup": {
                        "from": "workout_plans",
                        "let": {"workoutId": "$_id"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {"$eq": ["$_id", "$$workoutId"]},
                                    "plan_type": {"$ne": "personalized"},
                                }
                            }
                        ],
                        "as": "workout_info",
                    }
                },
                {"$unwind": "$workout_info"},
                {
                    "$project": {
                        "_id": 0,
                        "id": {"$toString": "$_id"},
                        "title": "$workout_info.name",
                        "image": "$workout_info.image_url",
                        "workoutCount": {
                            "$sum": {
                                "$map": {
                                    "input": "$workout_info.workout_schedule",
                                    "as": "day",
                                    "in": {"$size": "$$day.exercises"},
                                }
                            }
                        },
                    }
                },
            ]

            plans = list(mongo.db.users.aggregate(pipeline))

            return plans

        except Exception as e:
            raise RuntimeError(f"Error fetching popular workout plans: {e}")

    @staticmethod
    def delete_exercises(plan_id: str, exercises_to_delete: dict[str, list[str]]) -> bool:
        workout_plan = mongo.db.workout_plans.find_one({"_id": ObjectId(plan_id)})
        if not workout_plan:
            return False

        updated_schedule = []
        for day in workout_plan.get("workout_schedule", []):
            day_name = day["day_of_week"].lower()
            if day_name in exercises_to_delete:
                day["exercises"] = [
                    exercise
                    for exercise in day["exercises"]
                    if exercise["exercise_id"] not in exercises_to_delete[day_name]
                ]
            updated_schedule.append(day)

        result = mongo.db.workout_plans.update_one(
            {"_id": ObjectId(plan_id)},
            {
                "$set": {
                    "workout_schedule": updated_schedule,
                    "updated_at": datetime.now(),
                }
            },
        )
        return bool(result.modified_count > 0)

    @staticmethod
    def update_exercise_ids(
        plan_id: str, exercises_to_update: dict[str, list[dict[str, str]]]
    ) -> bool:
        workout_plan = mongo.db.workout_plans.find_one({"_id": ObjectId(plan_id)})
        if not workout_plan:
            return False

        updated_schedule = []
        for day in workout_plan.get("workout_schedule", []):
            day_name = day["day_of_week"].lower()
            if day_name in exercises_to_update:
                for exercise in day["exercises"]:
                    for replacement in exercises_to_update[day_name]:
                        if exercise["exercise_id"] == replacement["old_exercise_id"]:
                            exercise["exercise_id"] = replacement["new_exercise"]
            updated_schedule.append(day)

        result = mongo.db.workout_plans.update_one(
            {"_id": ObjectId(plan_id)},
            {
                "$set": {
                    "workout_schedule": updated_schedule,
                    "updated_at": datetime.now(),
                }
            },
        )
        return bool(result.modified_count > 0)
