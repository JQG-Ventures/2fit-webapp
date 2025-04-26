from __future__ import annotations

from app.Schemas.ExerciseSchema import exercise_schema, exercises_schema
from app.extensions import mongo
from bson.objectid import ObjectId
from datetime import datetime
from marshmallow import ValidationError


class Exercise:
    """CRUD operations for Exercise."""
    @staticmethod
    def get_exercises():
        """Return the list of workout plans that exists"""
        try:
            result = mongo.db.exercise.find({"is_active": True})
            return exercises_schema.dump(result)
        except Exception as e:
            raise Exception(f"Error retrieving exercises: {str(e)}")

    @staticmethod
    def create_exercise(data):
        """Create a new exercise in MongoDB with timestamps."""
        try:
            validated_data = exercise_schema.load(data)
            validated_data['created_at'] = datetime.now()
            validated_data['updated_at'] = datetime.now()
            result = mongo.db.exercise.insert_one(data)
            return str(result.inserted_id)
        except ValidationError as e:
            raise ValueError(f"Invalid data: {e.messages}")
        except Exception as e:
            raise Exception(f"Error creating exercise: {str(e)}")

    @staticmethod
    def create_bulk_exercises(data_list):
        """Create multiple exercises in MongoDB."""
        try:
            for data in data_list:
                data['created_at'] = datetime.now()
                data['updated_at'] = datetime.now()
            result = mongo.db.exercise.insert_many(data_list)
            return [str(inserted_id) for inserted_id in result.inserted_ids]
        except Exception as e:
            raise Exception(f"Error creating bulk exercises: {str(e)}")

    @staticmethod
    def get_exercise_by_id(exercise_id):
        """Fetch an exercise by its ID."""
        try:
            exercise = mongo.db.exercise.find_one({"_id": ObjectId(exercise_id)})
            if exercise:
                return exercise_schema.dump(exercise)
            return None
        except Exception as e:
            raise Exception(f"Error retrieving exercise: {str(e)}")

    @staticmethod
    def update_exercise(exercise_id, data):
        """Update an exercise by its ID and update the updated_at timestamp."""
        try:
            validated_data = exercise_schema.load(data)
            validated_data['updated_at'] = datetime.utcnow()

            result = mongo.db.exercise.update_one(
                {"_id": ObjectId(exercise_id)}, {"$set": validated_data}
            )
            return result.modified_count > 0
        except ValidationError as e:
            raise ValueError(f"Invalid data: {e.messages}")
        except Exception as e:
            raise Exception(f"Error updating exercise: {str(e)}")

    @staticmethod
    def delete_exercise(exercise_id):
        """Disable an exercise by its ID and update the updated_at timestamp."""
        try:
            result = mongo.db.exercise.update_one(
                {"_id": ObjectId(exercise_id)}, {"$set": {"is_active": False, "updated_at": datetime.now()}}
            )
            return result.modified_count > 0
        except Exception as e:
            raise Exception(f"Error updating exercise: {str(e)}")
        
    @staticmethod
    def get_similar_exercises(exercise_id):
        """Fetch exercises similar to the given exercise based on muscle_group and category."""
        try:
            exercise = mongo.db.exercise.find_one({"_id": ObjectId(exercise_id), "is_active": True})
            if not exercise:
                return []

            similar_exercises = mongo.db.exercise.find({
                "$and": [
                    {"_id": {"$ne": ObjectId(exercise_id)}},
                    {"category": exercise["category"]},
                    {"muscle_group": {"$in": exercise["muscle_group"]}}, 
                    {"is_active": True}
                ]
            })

            return exercises_schema.dump(similar_exercises)
        except Exception as e:
            raise Exception(f"Error retrieving similar exercises: {str(e)}")
