from bson import ObjectId
from app.extensions import mongo
from app.models.workouts import WorkoutPlan
from app.Schemas.WorkoutSchema import workout_plan_schema
from datetime import datetime, timedelta
import logging
import random

class WorkoutPlanGenerator:
    EXERCISE_COUNT_BY_LEVEL = {
        "beginner": {"min": 5, "max": 6},
        "intermediate": {"min": 6, "max": 8},
        "advanced": {"min": 7, "max": 10},
    }

    MUSCLE_GROUPS_MAPPING = {
        'full_body': ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'glutes', 'calves'],
        'upper_body': ['chest', 'back', 'shoulders', 'arms', 'triceps'],
        'lower_body': ['legs', 'glutes', 'calves'],
        'push': ['chest', 'shoulders', 'triceps'],
        'pull': ['back', 'arms'],
        'legs': ['legs', 'glutes', 'calves', 'quadricep'],
        'core': ['core', 'obliques'],
        'chest': ['chest', 'upper-chest'],
        'back': ['back', 'lower-back', 'trapezius', 'lats'],
        'shoulders': ['shoulders', 'front-deltoid', 'rear-deltoid', 'deltoid'],
        'arms': ['biceps', 'triceps', 'forearms']
    }

    @staticmethod
    def get_exercise_list():
        return list(mongo.db.exercise.find({}))

    @staticmethod
    def map_user_level(fitness_level: str) -> str:
        return {
            "beginner": "beginner",
            "irregular": "beginner",
            "intermediate": "intermediate",
            "advanced": "advanced"
        }.get(fitness_level, "beginner")

    @staticmethod
    def get_intensity_settings(level: str, fitness_goal: str) -> dict:
        base_settings = {
            "beginner": {"sets": 2, "reps": [12, 15], "rest": 60},
            "intermediate": {"sets": 3, "reps": [8, 12], "rest": 90},
            "advanced": {"sets": 4, "reps": [6, 10], "rest": 120}
        }.get(level, {"sets": 2, "reps": [12, 15], "rest": 60})

        if fitness_goal == 'weight':
            base_settings.update({"reps": [12, 15], "rest": 45})
        elif fitness_goal == 'strength':
            base_settings.update({"reps": [4, 6], "sets": base_settings["sets"] + 1, "rest": 180})
        elif fitness_goal == 'muscle':
            base_settings.update({"reps": [8, 12], "rest": 90})
        elif fitness_goal == 'keep':
            base_settings.update({"reps": [10, 12], "rest": 60})

        return base_settings

    @staticmethod
    def determine_plan_duration(user_profile: dict) -> int:
        fitness_goal = user_profile['fitness_goal']
        fitness_level = user_profile['fitness_level']

        durations = {
            'weight': 16,
            'strength': 12,
            'muscle': 12,
            'keep': 8
        }
        duration = durations.get(fitness_goal, 12)

        if fitness_level in ['beginner', 'irregular']:
            duration = min(duration, 8)
        elif fitness_level == 'advanced':
            duration = max(duration, 12)

        return duration

    @staticmethod
    def calculate_splits(days_available, fitness_goal):
        if days_available >= 5:
            return [
                ["chest", "shoulders", "triceps", "cardio"],
                ["back", "biceps"],
                ["legs", "glutes", "calves", "cardio"],
                ["full_body"],
                ["full_body"]
            ]
        elif days_available == 4:
            return [
                ["chest", "shoulders", "triceps"],
                ["back", "biceps", "cardio"],
                ["legs", "glutes", "calves"],
                ["full_body"]
            ]
        else:
            return [
                ["push", "cardio"],
                ["legs"],
                ["pull", "cardio"]
            ]


    @staticmethod
    def generate_day_routine(muscle_groups, exercises, settings, level, cardio=False):
        """
        Generates a structured routine for a specific day, including sets, reps, and rest for each exercise.
        Dynamically allocates exercises based on level and available muscle groups.
        """
        exercise_range = WorkoutPlanGenerator.EXERCISE_COUNT_BY_LEVEL[level]
        total_exercises = random.randint(exercise_range["min"], exercise_range["max"])

        if cardio:
            cardio_count = max(1, total_exercises // 3)
            strength_count = total_exercises - cardio_count
        else:
            strength_count = total_exercises
            cardio_count = 0

        daily_exercises = []
        expanded_muscle_groups = []
        for group in muscle_groups:
            expanded_muscle_groups.extend(WorkoutPlanGenerator.MUSCLE_GROUPS_MAPPING.get(group, []))
        expanded_muscle_groups = set(expanded_muscle_groups)

        strength_exercises = []
        for muscle_group in expanded_muscle_groups:
            group_exercises = [
                ex for ex in exercises if muscle_group in [mg.lower() for mg in ex["muscle_group"]]
            ]
            if group_exercises:
                strength_exercises.extend(random.sample(group_exercises, min(random.randint(1,2), len(group_exercises))))
            if len(strength_exercises) >= strength_count:
                break

        cardio_exercises = []
        if cardio:
            available_cardio = [ex for ex in exercises if ex["category"].lower() == "cardio"]
            cardio_exercises = random.sample(available_cardio, min(cardio_count, len(available_cardio)))

        for ex in strength_exercises[:strength_count]:
            daily_exercises.append({
                "exercise_id": str(ex["_id"]),
                "sets": settings["sets"],
                "reps": random.choice(settings["reps"]),
                "rest_seconds": settings["rest"],
            })
        for ex in cardio_exercises:
            daily_exercises.append({
                "exercise_id": str(ex["_id"]),
                "sets": 1,
                "reps": 10,
                "rest_seconds": 30,
            })

        return daily_exercises



    @staticmethod
    def generate_workout_plan(user_profile: dict):
        db_exercises = WorkoutPlanGenerator.get_exercise_list()
        level = WorkoutPlanGenerator.map_user_level(user_profile['fitness_level'])
        settings = WorkoutPlanGenerator.get_intensity_settings(level, user_profile['fitness_goal'])
        available_days = user_profile['training_preferences']['available_days']
        duration_weeks = WorkoutPlanGenerator.determine_plan_duration(user_profile)

        training_splits = WorkoutPlanGenerator.calculate_splits(len(available_days), user_profile['fitness_goal'])
        routine = []

        for i, day in enumerate(available_days):
            muscle_groups = training_splits[i % len(training_splits)]
            cardio = "cardio" in muscle_groups
            muscle_groups = [mg for mg in muscle_groups if mg != "cardio"]
            daily_routine = WorkoutPlanGenerator.generate_day_routine(muscle_groups, db_exercises, settings, level, cardio)
            routine.append({"day_of_week": day, "exercises": daily_routine})

        workout_routine = {
            "name": f"Auto Plan {user_profile['name']}",
            "description": f"A workout plan for user {user_profile['_id']}",
            "plan_type": "personalized",
            "duration_weeks": duration_weeks,
            "price": 0.0,
            "image_url": "",
            "video_url": "",
            "level": level,
            "is_active": True,
            "workout_schedule": routine
        }

        formatted_plan = workout_plan_schema.load(workout_routine)
        plan_id = WorkoutPlan.create_workout_plan(formatted_plan)

        WorkoutPlanGenerator.set_active_workout_plan_for_user(
            user_profile["_id"], plan_id, workout_routine["name"], duration_weeks
        )
        logging.info("User routine saved in db.")

    @staticmethod
    def set_active_workout_plan_for_user(user_id: str, plan_id: str, plan_name: str, duration_weeks: int):
        try:
            user_id = ObjectId(user_id)
            mongo.db.users.update_one(
                {"_id": user_id, "workout_history.active_plans.is_completed": False},
                {"$set": {"workout_history.active_plans.$[].is_completed": True}}
            )

            today = datetime.now()
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(weeks=duration_weeks)

            active_plan = {
                "workout_plan_id": plan_id,
                "workout_name": plan_name,
                "plan_type": "personalized",
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "is_completed": False,
                "progress": 0.0,
                "last_completed_workout": None,
                "progress_details": []
            }
            mongo.db.users.update_one(
                {"_id": user_id},
                {"$push": {"workout_history.active_plans": active_plan}}
            )

            logging.info(f"Set workout plan {plan_id} as active for user {user_id}.")
        except Exception as e:
            logging.error(f"Error setting active workout plan for user {user_id}: {str(e)}")
            raise Exception(f"Error setting active workout plan: {str(e)}")
