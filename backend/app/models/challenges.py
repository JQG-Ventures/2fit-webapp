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
    exercise_id: str
    sets: int
    reps: int
    rest_seconds: int
    details: ExerciseData


@dataclass
class ChallengeDay:
    sequence_day: int
    name: str
    is_rest: bool
    exercises: List[ChallengeExercise] = field(default_factory=list)


@dataclass
class Challenge:
    _id: Optional[Union[str, ObjectId]]
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
    @staticmethod
    def get_all() -> List[Challenge]:
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
        try:
            data = ChallengeSchema.dump(challenge)
            result = mongo.db.challenges.insert_one(data)
            return str(result.inserted_id)
        except Exception as e:
            logging.exception(f"Error creating challenge, error {e}")
            raise

    @staticmethod
    def update(challenge_id: str, challenge: Challenge) -> bool:
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
        try:
            result = mongo.db.challenges.update_one(
                {"_id": ObjectId(challenge_id)},
                {"$set": {"is_active": False, "updated_at": datetime.now().isoformat()}},
            )
            return bool(result.modified_count > 0)
        except Exception as e:
            logging.exception(f"Error deleting challenge, error {e}")
            raise
