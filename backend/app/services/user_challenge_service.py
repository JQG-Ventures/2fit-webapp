from app.extensions import mongo
from app.utils.utils import convert_to_objectid

import logging


logger = logging.getLogger(__name__)


class UserChallengeService:

    @staticmethod
    def save_challenge_progress(user_id: str, challenge_id: str, progress_data: dict) -> None:
        """
        Save the partial progress of a day in a challenge for a user
        - If exist an in_progress_challenge for same challenge_id, date, sequence day and exercises
        - If not create one
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
        Guarda un challenge day completo:
        - Lo mueve de active_challenges a completed_challenges en workout_history del usuario.
        - Agrega campos extras (duration total, calorías, etc) si lo deseas.
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
