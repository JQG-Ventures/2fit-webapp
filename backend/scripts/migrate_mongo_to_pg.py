"""
MongoDB -> PostgreSQL Data Migration Script

Usage:
    MONGO_URI=mongodb://localhost:27017/2fit \
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/twofit \
    python scripts/migrate_mongo_to_pg.py

This script reads all collections from the existing MongoDB database
and inserts them into the PostgreSQL database using the new ORM models.
It handles ObjectId -> UUID translation and nested document normalization.
"""
from __future__ import annotations

import logging
import os
import sys
import uuid
from typing import Any

from pymongo import MongoClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/2fit")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/twofit")

os.environ["DATABASE_URL"] = DATABASE_URL

ID_MAP: dict[str, uuid.UUID] = {}


def oid_to_uuid(oid: Any) -> uuid.UUID:
    key = str(oid)
    if key not in ID_MAP:
        ID_MAP[key] = uuid.uuid4()
    return ID_MAP[key]


def run_migration() -> None:
    mongo_client = MongoClient(MONGO_URI)
    mongo_db = mongo_client.get_default_database()

    from app import create_app
    app = create_app()

    with app.app_context():
        from app.extensions import db
        from app.models.challenge import Challenge, ChallengeDay, ChallengeDayExercise
        from app.models.content import Content
        from app.models.conversation import Conversation, Message
        from app.models.email import Email
        from app.models.exercise import Exercise
        from app.models.notification import NotificationDevice
        from app.models.progress import (
            ActiveChallenge,
            ActiveChallengeExercise,
            ActivePlan,
            CompletedChallengeDay,
            CompletedChallengeExercise,
            CompletedWorkout,
            CompletedWorkoutExercise,
            DayProgress,
            ExerciseProgress,
            SavedWorkout,
        )
        from app.models.user import User, UserAutomationData, UserPreference, UserSettings
        from app.models.workout_plan import WorkoutDay, WorkoutDayExercise, WorkoutPlan

        db.create_all()

        migrate_exercises(mongo_db, db)
        migrate_workout_plans(mongo_db, db)
        migrate_challenges(mongo_db, db)
        migrate_users(mongo_db, db)
        migrate_conversations(mongo_db, db)
        migrate_emails(mongo_db, db)
        migrate_contents(mongo_db, db)
        migrate_notification_devices(mongo_db, db)

        db.session.commit()
        logger.info("Migration completed successfully!")

    mongo_client.close()


def migrate_exercises(mongo_db: Any, db: Any) -> None:
    from app.models.exercise import Exercise

    exercises = list(mongo_db.exercise.find({}))
    logger.info(f"Migrating {len(exercises)} exercises...")

    for doc in exercises:
        ex_uuid = oid_to_uuid(doc["_id"])
        exercise = Exercise(
            id=ex_uuid,
            name=doc.get("name", ""),
            description=doc.get("description", ""),
            category=doc.get("category", "strength"),
            image_url=doc.get("image_url", ""),
            video_url=doc.get("video_url", ""),
            muscle_group=doc.get("muscle_group", []),
            difficulty=doc.get("difficulty", "beginner"),
            equipment=doc.get("equipment", []),
            instructions=doc.get("instructions", []),
            contradictions=doc.get("contradictions", []),
            is_active=doc.get("is_active", True),
        )
        db.session.add(exercise)

    db.session.flush()
    logger.info(f"Exercises migrated: {len(exercises)}")


def migrate_workout_plans(mongo_db: Any, db: Any) -> None:
    from app.models.workout_plan import WorkoutDay, WorkoutDayExercise, WorkoutPlan

    plans = list(mongo_db.workout_plans.find({}))
    logger.info(f"Migrating {len(plans)} workout plans...")

    for doc in plans:
        plan_uuid = oid_to_uuid(doc["_id"])
        plan = WorkoutPlan(
            id=plan_uuid,
            name=doc.get("name", ""),
            description=doc.get("description", ""),
            plan_type=doc.get("plan_type", "library"),
            duration_weeks=doc.get("duration_weeks"),
            price=doc.get("price"),
            image_url=doc.get("image_url", ""),
            video_url=doc.get("video_url", ""),
            level=doc.get("level", "beginner"),
            is_active=doc.get("is_active", True),
        )
        db.session.add(plan)
        db.session.flush()

        for day_doc in doc.get("workout_schedule", []):
            day = WorkoutDay(
                workout_plan_id=plan_uuid,
                day_of_week=day_doc.get("day_of_week"),
                sequence_day=day_doc.get("sequence_day"),
            )
            db.session.add(day)
            db.session.flush()

            for ex_doc in day_doc.get("exercises", []):
                ex_id_str = str(ex_doc.get("exercise_id", ""))
                ex_uuid = oid_to_uuid(ex_id_str) if ex_id_str else uuid.uuid4()
                wde = WorkoutDayExercise(
                    workout_day_id=day.id,
                    exercise_id=ex_uuid,
                    sets=ex_doc.get("sets", 0),
                    reps=ex_doc.get("reps", 0),
                    rest_seconds=ex_doc.get("rest_seconds", 0),
                )
                db.session.add(wde)

    db.session.flush()
    logger.info(f"Workout plans migrated: {len(plans)}")


def migrate_challenges(mongo_db: Any, db: Any) -> None:
    from app.models.challenge import Challenge, ChallengeDay, ChallengeDayExercise

    challenges = list(mongo_db.challenges.find({}))
    logger.info(f"Migrating {len(challenges)} challenges...")

    for doc in challenges:
        ch_uuid = oid_to_uuid(doc["_id"])
        challenge = Challenge(
            id=ch_uuid,
            name=doc.get("name", ""),
            description=doc.get("description", ""),
            plan_type=doc.get("plan_type", "challenge"),
            duration_days=doc.get("duration_days", 0),
            price=doc.get("price", 0.0),
            image_url=doc.get("image_url", ""),
            video_url=doc.get("video_url", ""),
            intensity=doc.get("intensity", True),
            equipment=doc.get("equipment"),
            category=doc.get("category", []),
            level=doc.get("level", "beginner"),
            is_active=doc.get("is_active", True),
        )
        db.session.add(challenge)
        db.session.flush()

        for day_doc in doc.get("workout_schedule", []):
            day = ChallengeDay(
                challenge_id=ch_uuid,
                sequence_day=day_doc.get("sequence_day", 0),
                name=day_doc.get("name", ""),
                is_rest=day_doc.get("is_rest", False),
            )
            db.session.add(day)
            db.session.flush()

            for ex_doc in day_doc.get("exercises", []):
                ex_id_str = str(ex_doc.get("exercise_id", ""))
                ex_uuid = oid_to_uuid(ex_id_str) if ex_id_str else uuid.uuid4()
                cde = ChallengeDayExercise(
                    challenge_day_id=day.id,
                    exercise_id=ex_uuid,
                    sets=ex_doc.get("sets", 0),
                    reps=ex_doc.get("reps", 0),
                    rest_seconds=ex_doc.get("rest_seconds", 0),
                )
                db.session.add(cde)

    db.session.flush()
    logger.info(f"Challenges migrated: {len(challenges)}")


def migrate_users(mongo_db: Any, db: Any) -> None:
    from app.models.progress import (
        ActiveChallenge,
        ActiveChallengeExercise,
        ActivePlan,
        CompletedChallengeDay,
        CompletedChallengeExercise,
        CompletedWorkout,
        CompletedWorkoutExercise,
        DayProgress,
        ExerciseProgress,
        SavedWorkout,
    )
    from app.models.user import User, UserAutomationData, UserPreference, UserSettings

    users = list(mongo_db.users.find({}))
    logger.info(f"Migrating {len(users)} users...")

    for doc in users:
        user_uuid = oid_to_uuid(doc["_id"])
        training_prefs = doc.get("training_preferences", {})

        user = User(
            id=user_uuid,
            name=doc.get("name", ""),
            last=doc.get("last", ""),
            age=doc.get("age", 0),
            birthdate=doc.get("birthdate", ""),
            code_number=doc.get("code_number", ""),
            country=doc.get("country", ""),
            number=doc.get("number", ""),
            gender=doc.get("gender", "m"),
            email=doc.get("email", ""),
            password_hash=doc.get("password_hash", ""),
            roles=doc.get("roles", ["user"]),
            height=doc.get("height", 0),
            weight=doc.get("weight", 0),
            target_weight=doc.get("target_weight", 0),
            profile_image=doc.get("profile_image", ""),
            auth_provider=doc.get("auth_provider", "default"),
            fitness_goal=doc.get("fitness_goal", "keep"),
            fitness_level=doc.get("fitness_level", "beginner"),
            preferred_muscle_groups=training_prefs.get("preferred_muscle_groups", []),
            equipment=training_prefs.get("equipment", []),
            available_days=training_prefs.get("available_days", []),
            workout_types=training_prefs.get("workout_types", []),
        )
        db.session.add(user)
        db.session.flush()

        prefs = doc.get("preferences", {})
        pref = UserPreference(
            user_id=user_uuid,
            water_consumption=prefs.get("water_consumption"),
            dietary_restrictions=prefs.get("dietary_restrictions", []),
            dietary_goals=prefs.get("dietary_goals"),
            preferences=prefs.get("preferences", []),
        )
        db.session.add(pref)

        stg = doc.get("settings", {})
        notif = stg.get("notifications", {})
        sec = stg.get("security_settings", {})
        settings = UserSettings(
            user_id=user_uuid,
            notification_general=notif.get("general", True),
            notification_updates=notif.get("updates", True),
            notification_services=notif.get("services", True),
            notification_tips=notif.get("tips", True),
            notification_bot=notif.get("bot", True),
            notification_reminders=notif.get("reminders", True),
            nutrition_enabled=stg.get("nutrition_enabled", False),
            language_preference=stg.get("language_preference", "es"),
            security_face_id=sec.get("face_id", True),
            security_remember_me=sec.get("remember_me", True),
            security_touch_id=sec.get("touch_id", True),
        )
        db.session.add(settings)

        auto = doc.get("automation_data", {})
        automation = UserAutomationData(
            user_id=user_uuid,
            profile_complete=auto.get("profile_complete", False),
            message_sent=auto.get("message_sent", False),
            greetings_sent=auto.get("greetings_sent", False),
            created_by_bot=auto.get("created_by_bot", False),
            last_motivational_message=auto.get("last_motivational_message"),
        )
        db.session.add(automation)

        workout_history = doc.get("workout_history", {})

        for sw_id in training_prefs.get("saved_workouts", []):
            sw_uuid = oid_to_uuid(sw_id)
            saved = SavedWorkout(user_id=user_uuid, workout_plan_id=sw_uuid)
            db.session.add(saved)

        for ap_doc in workout_history.get("active_plans", []):
            wp_id_str = str(ap_doc.get("workout_plan_id", ""))
            wp_uuid = oid_to_uuid(wp_id_str) if wp_id_str else uuid.uuid4()
            ap = ActivePlan(
                user_id=user_uuid,
                workout_plan_id=wp_uuid,
                workout_name=ap_doc.get("workout_name", ""),
                plan_type=ap_doc.get("plan_type", "personalized"),
                start_date=ap_doc.get("start_date", ""),
                end_date=ap_doc.get("end_date"),
                is_completed=ap_doc.get("is_completed", False),
                progress=ap_doc.get("progress", 0.0),
            )
            db.session.add(ap)
            db.session.flush()

            for dp_doc in ap_doc.get("progress_details", []):
                dp = DayProgress(
                    active_plan_id=ap.id,
                    week_number=dp_doc.get("week_number"),
                    day_of_week=dp_doc.get("day_of_week"),
                    sequence_day=dp_doc.get("sequence_day"),
                    is_completed=dp_doc.get("is_completed", False),
                )
                db.session.add(dp)
                db.session.flush()

                for ep_doc in dp_doc.get("exercises", []):
                    ex_uuid = oid_to_uuid(ep_doc.get("exercise_id", ""))
                    ep = ExerciseProgress(
                        day_progress_id=dp.id,
                        exercise_id=ex_uuid,
                        sets_completed=ep_doc.get("sets_completed", 0),
                        reps_completed=ep_doc.get("reps_completed", []),
                        duration_seconds=ep_doc.get("duration_seconds", 0),
                        calories_burned=ep_doc.get("calories_burned", 0.0),
                        is_completed=ep_doc.get("is_completed", False),
                    )
                    db.session.add(ep)

        for cw_doc in workout_history.get("completed_workouts", []):
            wp_id_str = str(cw_doc.get("workout_id", cw_doc.get("workout_plan_id", "")))
            wp_uuid = oid_to_uuid(wp_id_str) if wp_id_str else None
            cw = CompletedWorkout(
                user_id=user_uuid,
                workout_plan_id=wp_uuid,
                date=cw_doc.get("date", ""),
                duration_seconds=cw_doc.get("duration_seconds", 0),
                calories_burned=cw_doc.get("calories_burned", 0.0),
                day_of_week=cw_doc.get("day_of_week"),
                sequence_day=cw_doc.get("sequence_day"),
                was_skipped=cw_doc.get("was_skipped", False),
            )
            db.session.add(cw)
            db.session.flush()

            for ex_doc in cw_doc.get("exercises", []):
                ex_uuid = oid_to_uuid(ex_doc.get("exercise_id", ""))
                cwe = CompletedWorkoutExercise(
                    completed_workout_id=cw.id,
                    exercise_id=ex_uuid,
                    sets_completed=ex_doc.get("sets_completed", 0),
                    reps_completed=ex_doc.get("reps_completed", []),
                    duration_seconds=ex_doc.get("duration_seconds", 0),
                    calories_burned=ex_doc.get("calories_burned", 0.0),
                    is_completed=ex_doc.get("is_completed", True),
                )
                db.session.add(cwe)

        for ac_doc in workout_history.get("active_challenges", []):
            ch_uuid = oid_to_uuid(ac_doc.get("challenge_id", ""))
            ac = ActiveChallenge(
                user_id=user_uuid,
                challenge_id=ch_uuid,
                date=ac_doc.get("date", ""),
                sequence_day=ac_doc.get("sequence_day", 0),
            )
            db.session.add(ac)
            db.session.flush()

            for ex_doc in ac_doc.get("exercises", []):
                ex_uuid = oid_to_uuid(ex_doc.get("exercise_id", ""))
                ace = ActiveChallengeExercise(
                    active_challenge_id=ac.id,
                    exercise_id=ex_uuid,
                    sets_completed=ex_doc.get("sets_completed", 0),
                    reps_completed=ex_doc.get("reps_completed", []),
                    duration_seconds=ex_doc.get("duration_seconds", 0),
                    calories_burned=ex_doc.get("calories_burned", 0.0),
                    is_completed=ex_doc.get("is_completed", False),
                )
                db.session.add(ace)

        for cc_doc in workout_history.get("completed_challenges", []):
            ch_uuid = oid_to_uuid(cc_doc.get("challenge_id", ""))
            ccd = CompletedChallengeDay(
                user_id=user_uuid,
                challenge_id=ch_uuid,
                sequence_day=cc_doc.get("sequence_day", 0),
                date=cc_doc.get("date", ""),
                duration_seconds=cc_doc.get("duration_seconds", 0),
                calories_burned=cc_doc.get("calories_burned", 0.0),
                was_skipped=cc_doc.get("was_skipped", False),
            )
            db.session.add(ccd)
            db.session.flush()

            for ex_doc in cc_doc.get("exercises", []):
                ex_uuid = oid_to_uuid(ex_doc.get("exercise_id", ""))
                cce = CompletedChallengeExercise(
                    completed_challenge_day_id=ccd.id,
                    exercise_id=ex_uuid,
                    sets_completed=ex_doc.get("sets_completed", 0),
                    reps_completed=ex_doc.get("reps_completed", []),
                    duration_seconds=ex_doc.get("duration_seconds", 0),
                    calories_burned=ex_doc.get("calories_burned", 0.0),
                    is_completed=ex_doc.get("is_completed", True),
                )
                db.session.add(cce)

    db.session.flush()
    logger.info(f"Users migrated: {len(users)}")


def migrate_conversations(mongo_db: Any, db: Any) -> None:
    from app.models.conversation import Conversation, Message

    convos = list(mongo_db.conversations.find({}))
    logger.info(f"Migrating {len(convos)} conversations...")

    for doc in convos:
        user_id_raw = doc.get("user_id", "")
        if isinstance(user_id_raw, str) and user_id_raw.startswith("user_"):
            user_id_raw = user_id_raw[5:]

        user_uuid = oid_to_uuid(user_id_raw) if user_id_raw else uuid.uuid4()

        conv = Conversation(user_id=user_uuid)
        db.session.add(conv)
        db.session.flush()

        for msg in doc.get("messages", []):
            message = Message(
                conversation_id=conv.id,
                role=msg.get("role", "user"),
                content=msg.get("content", ""),
            )
            db.session.add(message)

    db.session.flush()
    logger.info(f"Conversations migrated: {len(convos)}")


def migrate_emails(mongo_db: Any, db: Any) -> None:
    from app.models.email import Email

    emails = list(mongo_db.emails.find({}))
    logger.info(f"Migrating {len(emails)} emails...")

    for doc in emails:
        email = Email(email=doc.get("email", ""))
        db.session.add(email)

    db.session.flush()
    logger.info(f"Emails migrated: {len(emails)}")


def migrate_contents(mongo_db: Any, db: Any) -> None:
    from app.models.content import Content

    contents = list(mongo_db.contents.find({}))
    logger.info(f"Migrating {len(contents)} contents...")

    for doc in contents:
        content = Content(
            title=doc.get("title", ""),
            description=doc.get("description", ""),
            tags=doc.get("tags", []),
            file_path=doc.get("file_path", ""),
            blob_url=doc.get("blob_url", ""),
        )
        db.session.add(content)

    db.session.flush()
    logger.info(f"Contents migrated: {len(contents)}")


def migrate_notification_devices(mongo_db: Any, db: Any) -> None:
    from app.models.notification import NotificationDevice

    devices = list(mongo_db.notification_devices.find({}))
    logger.info(f"Migrating {len(devices)} notification devices...")

    for doc in devices:
        user_id_raw = str(doc.get("user_id", ""))
        user_uuid = oid_to_uuid(user_id_raw) if user_id_raw else uuid.uuid4()

        device = NotificationDevice(
            user_id=user_uuid,
            player_id=doc.get("player_id", ""),
            platform=doc.get("platform"),
            last_used=doc.get("last_used"),
        )
        db.session.add(device)

    db.session.flush()
    logger.info(f"Notification devices migrated: {len(devices)}")


if __name__ == "__main__":
    run_migration()
