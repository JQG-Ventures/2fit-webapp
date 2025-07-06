"""
Service for handling user progress in workout challenges.

Provides methods to:
- Save partial progress for a challenge day
- Move completed challenge days from active to completed
"""

from app.extensions import mongo
from app.utils.utils import convert_to_objectid

import logging


logger = logging.getLogger(__name__)


class UserChallengeService:
    """
    Handles the logic for updating a user's challenge progress.

    This service updates the `workout_history` field in the user document,
    including both active and completed challenge states.
    """

    @staticmethod
    def save_challenge_progress(user_id: str, challenge_id: str, progress_data: dict) -> None:
        """
        Save or update the user's partial progress for a challenge day.

        Logic:
        - If an entry exists in `active_challenges` for same challenge ID, sequence_day, and date,
        it updates the exercise stats (sets, reps, duration, etc.).
        - Otherwise, it creates a new active challenge progress entry.

        Args:
            user_id (str): The ID of the user.
            challenge_id (str): The ID of the challenge.
            progress_data (dict): Data with keys: date, sequence_day, and a list of exercises.
        """
        try:
            user_obj_id = convert_to_objectid(user_id)
            challenge_obj_id = convert_to_objectid(challenge_id)

            user_doc = mongo.db.users.find_one({"_id": user_obj_id})
            if not user_doc:
                raise Exception("Usuario no encontrado.")

            active_challenges = user_doc.get("workout_history", {}).get("active_challenges", [])
            in_prog = None

            for ch in active_challenges:
                if ch.get("challenge_id") == challenge_obj_id:
                    in_prog = ch
                    break

            if in_prog:
                if (
                    in_prog.get("sequence_day") == progress_data["sequence_day"]
                    and in_prog.get("date") == progress_data["date"]
                ):
                    existing_exs = {ex["exercise_id"]: ex for ex in in_prog.get("exercises", [])}
                    new_exs = {ex["exercise_id"]: ex for ex in progress_data["exercises"]}

                    for ex_id, ex_data in new_exs.items():
                        if ex_id in existing_exs:
                            exist = existing_exs[ex_id]
                            exist["sets_completed"] = max(
                                exist.get("sets_completed", 0),
                                ex_data.get("sets_completed", 0),
                            )
                            exist["reps_completed"] = exist.get("reps_completed", []) + ex_data.get(
                                "reps_completed", []
                            )
                            exist["duration_seconds"] = exist.get(
                                "duration_seconds", 0
                            ) + ex_data.get("duration_seconds", 0)
                            exist["calories_burned"] = exist.get(
                                "calories_burned", 0
                            ) + ex_data.get("calories_burned", 0)
                            exist["is_completed"] = exist.get("is_completed", False) or ex_data.get(
                                "is_completed", False
                            )
                        else:
                            existing_exs[ex_id] = ex_data

                    in_prog["exercises"] = list(existing_exs.values())
                else:
                    in_prog["date"] = progress_data["date"]
                    in_prog["sequence_day"] = progress_data["sequence_day"]
                    in_prog["exercises"] = progress_data["exercises"]
            else:
                new_in_prog = {
                    "challenge_id": challenge_obj_id,
                    "date": progress_data["date"],
                    "sequence_day": progress_data["sequence_day"],
                    "exercises": progress_data["exercises"],
                }
                active_challenges.append(new_in_prog)

            mongo.db.users.update_one(
                {"_id": user_obj_id},
                {"$set": {"workout_history.active_challenges": active_challenges}},
            )

        except Exception as e:
            logger.error(f"Error en save_challenge_progress: {e}")
            raise

    @staticmethod
    def save_completed_challenge(user_id: str, completed_data: dict) -> None:
        """
        Mark a challenge day as completed for a user.

        Moves the entry from `active_challenges` to `completed_challenges`
        in the user's `workout_history`.

        It also calculates:
        - Total duration (seconds)
        - Total calories burned

        Args:
            user_id (str): The ID of the user.
            completed_data (dict): Must include challenge_id, sequence_day, date, and exercises.
        """
        try:
            user_obj_id = convert_to_objectid(user_id)
            challenge_id = completed_data["challenge_id"]
            sequence_day = completed_data["sequence_day"]
            exercises = completed_data["exercises"]

            user_doc = mongo.db.users.find_one({"_id": user_obj_id})
            if not user_doc:
                raise Exception("Usuario no encontrado.")

            active_challenges = user_doc.get("workout_history", {}).get("active_challenges", [])
            completed_challenges_list = user_doc.get("workout_history", {}).get(
                "completed_challenges", []
            )
            in_prog = None

            for ch in active_challenges:
                if ch.get("challenge_id") == challenge_id:
                    in_prog = ch
                    break

            total_duration = sum(ex.get("duration_seconds", 0) for ex in exercises)
            total_calories = sum(ex.get("calories_burned", 0) for ex in exercises)

            completed_entry = {
                "challenge_id": challenge_id,
                "sequence_day": sequence_day,
                "date": completed_data["date"],
                "duration_seconds": total_duration,
                "calories_burned": total_calories,
                "exercises": exercises,
                "was_skipped": False,
            }

            completed_challenges_list.append(completed_entry)

            if in_prog:
                active_challenges = [
                    ch for ch in active_challenges if ch.get("challenge_id") != challenge_id
                ]

            mongo.db.users.update_one(
                {"_id": user_obj_id},
                {
                    "$set": {
                        "workout_history.active_challenges": active_challenges,
                        "workout_history.completed_challenges": completed_challenges_list,
                    }
                },
            )

        except Exception as e:
            logger.error(f"Error en save_completed_challenge: {e}")
            raise
