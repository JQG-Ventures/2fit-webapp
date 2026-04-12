"""
Patch the existing personalized workout plan for the test user.
- Fills the 5 existing days (Mon–Fri) with strength exercises
- Adds Saturday (cardio/HIIT) and Sunday (yoga/active recovery)
- Each day gets 6 exercises, sets/reps/rest tuned per day focus

Run: docker compose exec backend python scripts/patch_user_plan.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app import create_app
from app.extensions import db
from app.models.workout_plan import WorkoutDay, WorkoutDayExercise, WorkoutPlan

WORKOUT_PLAN_ID = uuid.UUID("695c403e-a4f6-4c2e-92ff-98659903d7e4")

# Exercise IDs from the seeded data (strength pool)
EX = {
    # Chest
    "bench_press": uuid.UUID("ea9fd836-f660-4f46-8aa9-c54e71e63679"),
    "dumbbell_flyes": uuid.UUID("b0ffba77-589a-4a0f-9287-84c6a97f8e0b"),
    "push_up": uuid.UUID("66f60d96-8fea-45d2-a55b-b7d11d6edeeb"),
    "diamond_push_up": uuid.UUID("bb2c9e98-c398-4cb1-8a6f-871667392c25"),
    "decline_press": uuid.UUID("8f4d3cb0-b798-4d49-99f8-30af437fc14b"),
    # Back
    "pull_up": uuid.UUID("1a294504-d7b6-463b-8483-42313e21e275"),
    "chin_up": uuid.UUID("ab64d5ed-17de-45e3-9f09-6d528b4ad454"),
    "deadlift": uuid.UUID("38d15d63-1a5a-463d-ae13-fc6b253d707f"),
    "dumbbell_row": uuid.UUID("51ce23a4-519c-4608-b33a-1c21fdeb2e91"),
    "inverted_row": uuid.UUID("43781514-5fa5-4607-89f6-501ef4cb8f6b"),
    # Legs
    "squat": uuid.UUID("29319eb8-d7ca-4ca5-b708-63a2c66e1bcd"),
    "goblet_squat": uuid.UUID("ece614c0-a181-4900-b7ef-e28fa75fbdb7"),
    "bw_squat": uuid.UUID("9000b4eb-568a-4ede-b3ca-7f7f9ddd563f"),
    "lunge": uuid.UUID("8313256f-cc9e-4a6d-a62c-bcea63e44754"),
    "bulgarian": uuid.UUID("c4b04f8e-147a-4a11-9aa0-d1392901f14e"),
    "rdl": uuid.UUID("31d40cb4-9eab-4d4a-9542-f8f9c1984f4b"),
    "calf_raise": uuid.UUID("26d109f4-ff76-41bf-9f7a-67abe0b7045f"),
    # Shoulders
    "ohp": uuid.UUID("a3f2b8e6-fdbf-447d-8d36-1910248a9665"),
    "arnold_press": uuid.UUID("f3e26c50-943f-48c4-9117-ad476ce1f6f5"),
    "lateral_raise": uuid.UUID("fee53386-b87f-4d15-91e7-cf724e9fc284"),
    "face_pull": uuid.UUID("31e91bd9-ac3f-4dcb-86b8-251009447530"),
    "pike_push_up": uuid.UUID("8bc2fd69-61b8-4855-abe1-c717a5e25a3c"),
    # Arms
    "bicep_curl": uuid.UUID("cabdac25-33ef-4062-9f6c-b78d48f0945f"),
    "hammer_curl": uuid.UUID("953790a6-5fe5-412b-9544-2bad51115211"),
    "tricep_dip": uuid.UUID("6311df87-0b59-4458-9085-c346fcff2c4d"),
    "skull_crusher": uuid.UUID("6ae81497-cac6-41c7-aaf1-1436ac595165"),
    "close_grip_pushup": uuid.UUID("dc8d4df0-5f8c-4519-bd92-6c58e89dc711"),
    # Core
    "plank": uuid.UUID("44fa880e-eb76-4e3a-9432-b9fba93bba56"),
    "side_plank": uuid.UUID("36b358fe-0f17-4190-8bc8-4d0c50fc8b1a"),
    "hollow_hold": uuid.UUID("1852b5c6-6b1b-40a6-b150-396668592d3d"),
    "hanging_leg_raise": uuid.UUID("2f302c58-8702-4714-bd09-fdf787db4d57"),
    "ab_wheel": uuid.UUID("4cc861c6-d513-4272-9834-9310cd65b8a7"),
    "russian_twist": uuid.UUID("ccbb9369-c1b2-4244-88ff-12eae85487f4"),
    "superman": uuid.UUID("4118fd75-d282-48c7-a3f5-a76c6776c928"),
    # Cardio
    "burpee": uuid.UUID("a78961e4-e656-43e4-b672-63051a9c0277"),
    "high_knees": uuid.UUID("25c3e932-69a6-4705-bee7-1504e8a4bd98"),
    "mountain_climber": uuid.UUID("fb5afea9-5c25-44d4-964a-b5a5a0b9318f"),
    "jumping_jack": uuid.UUID("ccef206b-31ae-4ed2-9e5a-0c45ee0f0b80"),
    "squat_jump": uuid.UUID("62417c44-732a-431a-8d91-696004ffddef"),
    "box_jump": uuid.UUID("48ce30fb-8222-41d6-95d9-f8a1de160df7"),
    "rope_jump": uuid.UUID("fe69d7c5-d21b-459c-b3c1-3987139dcdc8"),
    "bear_crawl": uuid.UUID("569ab067-c540-414a-b5ea-7ded5bb8617b"),
    # Yoga
    "downward_dog": uuid.UUID("d8c2d6a0-3e9a-4b7d-bef6-2f1a3c5e7890") if False else None,
    "child_pose": uuid.UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890") if False else None,
}

# (sets, reps, rest_seconds) per exercise per day
# format: (exercise_key, sets, reps, rest_seconds)
DAY_PROGRAMS = {
    "monday": [
        # Chest + Triceps
        ("bench_press", 4, 10, 90),
        ("dumbbell_flyes", 3, 12, 60),
        ("diamond_push_up", 3, 15, 60),
        ("decline_press", 3, 12, 75),
        ("tricep_dip", 3, 12, 60),
        ("skull_crusher", 3, 10, 75),
    ],
    "tuesday": [
        # Back + Biceps
        ("deadlift", 4, 8, 120),
        ("pull_up", 4, 8, 90),
        ("dumbbell_row", 3, 12, 60),
        ("inverted_row", 3, 12, 60),
        ("bicep_curl", 3, 12, 60),
        ("hammer_curl", 3, 12, 60),
    ],
    "wednesday": [
        # Legs
        ("squat", 4, 10, 120),
        ("rdl", 3, 12, 90),
        ("bulgarian", 3, 12, 75),
        ("lunge", 3, 16, 60),
        ("goblet_squat", 3, 15, 60),
        ("calf_raise", 4, 20, 45),
    ],
    "thursday": [
        # Shoulders + Core
        ("ohp", 4, 10, 90),
        ("arnold_press", 3, 12, 75),
        ("lateral_raise", 3, 15, 45),
        ("face_pull", 3, 15, 45),
        ("pike_push_up", 3, 12, 60),
        ("plank", 3, 45, 30),  # reps = seconds held (for plank)
    ],
    "friday": [
        # Full Body Strength
        ("push_up", 4, 20, 60),
        ("chin_up", 4, 8, 90),
        ("bw_squat", 4, 20, 45),
        ("hollow_hold", 3, 30, 45),
        ("russian_twist", 3, 20, 45),
        ("superman", 3, 15, 45),
    ],
    "saturday": [
        # HIIT Cardio
        ("burpee", 4, 10, 45),
        ("squat_jump", 4, 15, 45),
        ("mountain_climber", 4, 20, 30),
        ("high_knees", 4, 30, 30),
        ("box_jump", 3, 10, 60),
        ("rope_jump", 3, 30, 45),
    ],
    "sunday": [
        # Active Recovery — light cardio + core
        ("jumping_jack", 3, 30, 30),
        ("bear_crawl", 3, 10, 45),
        ("side_plank", 3, 30, 30),
        ("hanging_leg_raise", 3, 12, 60),
        ("ab_wheel", 3, 10, 75),
        ("close_grip_pushup", 3, 15, 45),
    ],
}


def patch():
    app = create_app()
    with app.app_context():
        db.create_all()

        existing_days = db.session.scalars(
            select(WorkoutDay).where(WorkoutDay.workout_plan_id == WORKOUT_PLAN_ID)
        ).all()

        day_map = {d.day_of_week: d for d in existing_days}
        print(f"[patch] Existing days: {list(day_map.keys())}")

        for day_name, exercises in DAY_PROGRAMS.items():
            if day_name in day_map:
                day = day_map[day_name]
                print(f"[patch] Updating existing day: {day_name}")
            else:
                day = WorkoutDay(
                    workout_plan_id=WORKOUT_PLAN_ID,
                    day_of_week=day_name,
                    sequence_day=None,
                )
                db.session.add(day)
                db.session.flush()
                print(f"[patch] Created new day: {day_name}")

            # Remove stale exercises
            db.session.query(WorkoutDayExercise).filter_by(workout_day_id=day.id).delete()
            db.session.flush()

            seen = set()
            for ex_key, sets, reps, rest in exercises:
                ex_id = EX.get(ex_key)
                if not ex_id or ex_id in seen:
                    continue
                seen.add(ex_id)
                db.session.add(
                    WorkoutDayExercise(
                        workout_day_id=day.id,
                        exercise_id=ex_id,
                        sets=sets,
                        reps=reps,
                        rest_seconds=rest,
                    )
                )

        db.session.commit()
        print("[patch] ✓ Done. Workout plan patched with 7 days of exercises.")

        # Verify
        stmt = (
            select(WorkoutPlan)
            .where(WorkoutPlan.id == WORKOUT_PLAN_ID)
            .options(joinedload(WorkoutPlan.workout_days).joinedload(WorkoutDay.exercises))
        )
        plan = db.session.scalars(stmt).unique().first()
        print(f"\n[patch] Plan: {plan.name}")
        for d in sorted(
            plan.workout_days,
            key=lambda x: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
            ].index(x.day_of_week or ""),
        ):
            print(f"  {d.day_of_week:12s} → {len(d.exercises)} exercises")


if __name__ == "__main__":
    patch()
