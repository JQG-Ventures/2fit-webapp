"""
Defines the Challenge data model and provides database operations for managing challenges.

Includes:
- Data classes for Challenge structure and schedule
- MongoDB integration for CRUD operations on challenges
- Data enrichment with exercise details
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Union, cast
from bson import ObjectId
from app.extensions import mongo
from marshmallow_dataclass import class_schema
from app.Schemas.ExerciseSchema import exercise_schema
from app.models.exercise import ExerciseData

import logging


@dataclass
class ChallengeExercise:
    """
    Represents an exercise within a challenge day.

    Attributes:
        exercise_id (str): The ID of the exercise.
        sets (int): Number of sets.
        reps (int): Number of repetitions per set.
        rest_seconds (int): Rest time in seconds between sets.
        details (ExerciseData): Additional exercise metadata.
    """

    exercise_id: str
    sets: int
    reps: int
    rest_seconds: int
    details: ExerciseData


@dataclass
class ChallengeDay:
    """
    Represents a day in a workout challenge.

    Attributes:
        sequence_day (int): Day number in the challenge.
        name (str): Name or label of the day.
        is_rest (bool): Indicates if the day is a rest day.
        exercises (List[ChallengeExercise]): List of exercises for the day.
    """

    sequence_day: int
    name: str
    is_rest: bool
    exercises: List[ChallengeExercise] = field(default_factory=list)


@dataclass
class Challenge:
    """
    Represents a complete workout challenge.

    Attributes:
        _id (Optional[str]): MongoDB document ID as string.
        name (str): Name of the challenge.
        description (str): Description of the challenge.
        plan_type (str): Plan category (e.g., "challenge").
        duration_days (int): Total number of days in the challenge.
        price (float): Price of the challenge.
        image_url (str): URL of the challenge image.
        video_url (Optional[str]): Optional video link.
        equipment (Optional[List[str]]): Required equipment.
        workout_schedule (List[ChallengeDay]): Daily workout plan.
        level (str): Difficulty level ("beginner", "intermediate", "advanced").
        is_active (bool): Whether the challenge is active.
        category (List[str]): List of tags or categories.
        intensity (bool): Indicates if intensity is enabled.
        created_at (str): Timestamp of creation.
        updated_at (str): Timestamp of last update.
    """

    _id: Optional[str]
    name: str
    description: str
    plan_type: str
    duration_days: int
    price: float
    image_url: str
    video_url: Optional[str]
    equipment: Optional[List[str]]
    workout_schedule: List[ChallengeDay]
    level: str
    is_active: bool = True
    category: List[str] = field(default_factory=list)
    intensity: bool = True
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())


ChallengeSchema = class_schema(Challenge)()


class ChallengeModel:
    """
    Provides database operations for the Challenge model.

    Methods:
        get_all: Fetch all active challenges.
        get_by_id: Retrieve a challenge by ID, enriched with exercise details.
        create: Insert a new challenge into the database.
        update: Update an existing challenge.
        delete: Soft-delete (deactivate) a challenge.
    """

    @staticmethod
    def get_all() -> List[Challenge]:
        """
        Retrieve all active challenges from the database.

        Returns:
            List[Challenge]: A list of active challenge instances.
        """
        try:
            raw = mongo.db.challenges.find({"is_active": True})
            docs = []
            for doc in raw:
                doc["_id"] = str(doc["_id"])
                docs.append(ChallengeSchema.load(doc))
            return docs
        except Exception as e:
            logging.exception(f"Error loading challenges, error {e}")
            raise

    @staticmethod
    def get_by_id(challenge_id: str) -> Optional[Challenge]:
        """
        Retrieve a challenge by ID and enrich its exercises with metadata.

        Args:
            challenge_id (str): The MongoDB ObjectId of the challenge.

        Returns:
            Optional[Challenge]: The challenge object or None if not found.
        """
        try:
            challenge = mongo.db.challenges.find_one({"_id": ObjectId(challenge_id)})

            if not challenge:
                return None

            challenge["_id"] = str(challenge["_id"])
            exercise_ids = set()

            for day in challenge.get("workout_schedule", []):
                for ex in day.get("exercises", []):
                    exercise_id = ex.get("exercise_id") or ex.get("exerciseId")
                    if exercise_id:
                        exercise_ids.add(ObjectId(exercise_id))

            exercise_map = {}
            if exercise_ids:
                exercises = list(mongo.db.exercise.find({"_id": {"$in": list(exercise_ids)}}))
                exercise_map = {str(ex["_id"]): exercise_schema.dump(ex) for ex in exercises}

            for day in challenge.get("workout_schedule", []):
                updated_exercises = []
                for ex in day.get("exercises", []):
                    exercise_id = ex.get("exercise_id") or ex.get("exerciseId")
                    if exercise_id and exercise_id in exercise_map:
                        enriched = {
                            **exercise_map[exercise_id],
                            "sets": ex.get("sets", 1),
                            "reps": ex.get("reps", 10),
                            "rest_seconds": ex.get("rest_seconds", 60),
                            "exercise_id": exercise_id,
                        }
                        updated_exercises.append(enriched)
                day["exercises"] = updated_exercises
            return cast(Challenge, ChallengeSchema.load(challenge))
        except Exception as e:
            logging.exception(f"Error fetching challenge by ID, error {e}")
            raise

    @staticmethod
    def create(challenge: Challenge) -> str:
        """
        Insert a new challenge into the database.

        Args:
            challenge (Challenge): The challenge object to insert.

        Returns:
            str: The ID of the newly created challenge.
        """
        try:
            data = ChallengeSchema.dump(challenge)
            result = mongo.db.challenges.insert_one(data)
            return str(result.inserted_id)
        except Exception as e:
            logging.exception(f"Error creating challenge, error {e}")
            raise

    @staticmethod
    def update(challenge_id: str, challenge: Challenge) -> bool:
        """
        Update an existing challenge with new data.

        Args:
            challenge_id (str): The ID of the challenge to update.
            challenge (Challenge): The updated challenge object.

        Returns:
            bool: True if the challenge was updated, False otherwise.
        """
        try:
            data = ChallengeSchema.dump(challenge)
            data["updated_at"] = datetime.now().isoformat()
            result = mongo.db.challenges.update_one({"_id": ObjectId(challenge_id)}, {"$set": data})
            return bool(result.modified_count > 0)
        except Exception as e:
            logging.exception(f"Error updating challenge, error {e}")
            raise

    @staticmethod
    def delete(challenge_id: str) -> bool:
        """
        Soft-delete a challenge by marking it as inactive.

        Args:
            challenge_id (str): The ID of the challenge to delete.

        Returns:
            bool: True if the challenge was marked as inactive, False otherwise.
        """
        try:
            result = mongo.db.challenges.update_one(
                {"_id": ObjectId(challenge_id)},
                {"$set": {"is_active": False, "updated_at": datetime.now().isoformat()}},
            )
            return bool(result.modified_count > 0)
        except Exception as e:
            logging.exception(f"Error deleting challenge, error {e}")
            raise
