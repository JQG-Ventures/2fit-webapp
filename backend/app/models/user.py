"""User model with CRUD operations and MongoDB integrations."""

from __future__ import annotations

from app.Schemas.ConversationSchema import conversation_schema
from app.Schemas.UserSchema import user_schema
from app.Schemas.WorkoutSchema import workout_plans_schema
from app.extensions import mongo
from bson import ObjectId
from datetime import datetime
from marshmallow import ValidationError
from app.utils.utils import convert_to_objectid
from typing import Optional


class User:
    """
    User model class to interact with the user collection in MongoDB.
    """

    @staticmethod
    def get_user_by_id(user_id: str) -> dict | None:
        """Fetch a user by ID."""
        try:
            search_id = convert_to_objectid(user_id)
            user = mongo.db.users.find_one({"_id": search_id})

            if not user:
                raise ValueError("User_id not found")

            return user_schema.dump(user)  # type: ignore[no-any-return]
        except Exception as e:
            raise RuntimeError(f"Error fetching user: {e}")

    @staticmethod
    def get_user_by_number(user_number: str) -> dict | None:
        """Fetch a user by their phone number."""
        try:
            user = mongo.db.users.find_one({"number": user_number})

            if not user:
                return None

            return user_schema.dump(user)  # type: ignore[no-any-return]
        except Exception as e:
            raise RuntimeError(f"Error fetching user: {e}")

    @staticmethod
    def get_user_by_email(email: str) -> dict | None:
        """Fetch a user by their email."""
        try:
            user = mongo.db.users.find_one({"email": email})

            if not user:
                return None

            return user_schema.dump(user)  # type: ignore[no-any-return]
        except Exception as e:
            raise RuntimeError(f"Error fetching user: {e}")

    @staticmethod
    def create_new_user(data: dict) -> str:
        """Insert a new user into the database."""

        try:
            data["created_at"] = datetime.now()
            data["updated_at"] = datetime.now()

            result = mongo.db.users.insert_one(data)
            return str(result.inserted_id)
        except ValidationError as e:
            raise ValueError(f"Invalid data: {e.messages}")
        except Exception as e:
            raise Exception(f"Error creating user: {str(e)}")

    @staticmethod
    def update_user_data(user_id: str, data: dict) -> bool:
        """Update a user's data in the database."""
        try:
            search_id = convert_to_objectid(user_id)
            data["updated_at"] = datetime.now()

            result = mongo.db.users.update_one({"_id": search_id}, {"$set": data})

            if result.modified_count == 0:
                raise ValueError("Error updating user data")
            return True
        except ValidationError as e:
            raise ValueError(f"Invalid data: {e.messages}")
        except Exception as e:
            raise Exception(f"Error updating workout plan: {str(e)}")

    @staticmethod
    def update_user_credentials(user_id: str, email: str, password_hash: str) -> bool:
        """Update the user's credentials like email and password."""
        search_id = convert_to_objectid(user_id)
        result = mongo.db.users.update_one(
            {"_id": search_id},
            {
                "$set": {
                    "email": email,
                    "password_hash": password_hash,
                    "updated_at": datetime.now(),
                }
            },
        )
        return bool(result.modified_count > 0)

    @staticmethod
    def add_saved_workout(user_id: str, workout_ids: list[str]) -> bool:
        """Add a workout to the user's saved workouts."""
        if not workout_ids:
            raise ValueError("No workout IDs provided to add.")

        search_id = convert_to_objectid(user_id)
        result = mongo.db.users.update_one(
            {"_id": search_id},
            {"$addToSet": {"training_preferences.saved_workouts": {"$each": workout_ids}}},
        )
        if result.matched_count == 0:
            raise ValueError(f"Error saving workouts for user {user_id}")
        return True

    @staticmethod
    def delete_saved_workout(user_id: str, workout_id: str) -> bool:
        """Add a workout to the user's saved workouts."""
        search_id = convert_to_objectid(user_id)
        result = mongo.db.users.update_one(
            {"_id": search_id},
            {"$pull": {"training_preferences.saved_workouts": workout_id}},
        )
        if result.modified_count == 0:
            raise ValueError(f"Error deleting workout for user {user_id}")
        return True

    @staticmethod
    def get_saved_workouts(user_id: str) -> list:
        """Fetch a list of saved workouts for the user."""
        try:
            search_id = convert_to_objectid(user_id)

            user = mongo.db.users.find_one({"_id": search_id})

            if not user:
                raise ValueError(f"User with id {search_id} not found!")

            saved_workouts_ids = user["training_preferences"]["saved_workouts"]
            object_ids = [ObjectId(id) for id in saved_workouts_ids]
            workouts = mongo.db.workout_plans.find({"_id": {"$in": object_ids}, "is_active": True})

            return workout_plans_schema.dump(list(workouts))  # type: ignore[no-any-return]
        except Exception as e:
            raise RuntimeError(f"Error getting the saved workouts for user {user_id}, error {e}")

    @staticmethod
    def get_user_chat_by_id(user_id: str) -> Optional[dict]:
        """Fetch a conversation by users ID."""
        try:
            user = User.get_user_by_id(user_id)

            if not user:
                raise RuntimeError("User does not exists")

            conversation = mongo.db.conversations.find_one(
                {"user_id": f"user_{user['code_number']}{user['number']}"}
            )

            if not conversation:
                return {}

            conversation = conversation_schema.dump(conversation)["messages"]

            return conversation[1:] if conversation else None
        except Exception as e:
            raise RuntimeError(f"Error fetching user conversation: {e}")

    @staticmethod
    def get_current_active_plans(user_id: str) -> list:
        """Get the list of active plans for the user."""
        try:
            user = User.get_user_by_id(user_id)

            if not user:
                raise ValueError(f"User with ID {user_id} not found!")

            plans = user["workout_history"].get("active_plans", [])

            return plans  # type: ignore[no-any-return]
        except ValidationError as e:
            raise ValueError(f"Invalid data: {e.messages}")
        except Exception as e:
            raise Exception(f"Error getting user plans: {str(e)}")
