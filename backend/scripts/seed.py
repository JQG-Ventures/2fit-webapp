"""
Seed script: exercises, workout plans, and challenges.

Usage:
    cd backend
    python scripts/seed.py

Docker:
    docker compose exec backend python scripts/seed.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models.challenge import Challenge, ChallengeDay, ChallengeDayExercise
from app.models.exercise import Exercise
from app.models.workout_plan import WorkoutDay, WorkoutDayExercise, WorkoutPlan
from app.repositories.muscle_repository import (
    ensure_muscles_seeded,
    sync_exercise_muscle_links_from_legacy,
)

# ---------------------------------------------------------------------------
# Media helpers
# ---------------------------------------------------------------------------


def image_url(name: str) -> str:
    slug = name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("/", "-")
    return f"https://picsum.photos/seed/{slug}/400/300"


VIDEO_BY_CATEGORY = {
    "strength": "https://www.w3schools.com/html/mov_bbb.mp4",
    "cardio": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    "yoga": "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    "dance": "https://www.w3schools.com/html/movie.mp4",
    "plan": "https://download.samplelib.com/mp4/sample-5s.mp4",
}


# ---------------------------------------------------------------------------
# Exercise definitions
# ---------------------------------------------------------------------------

EXERCISES_DATA = [
    # ------------------------------------------------------------------ STRENGTH
    # Chest
    {
        "name": "Barbell Bench Press",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["chest", "triceps", "shoulders"],
        "equipment": ["barbell", "bench"],
        "instructions": [
            "Lie on a flat bench and grip the barbell slightly wider than shoulder-width.",
            "Unrack the bar and lower it slowly to your mid-chest.",
            "Press the bar back up to full arm extension.",
            "Keep your feet flat on the floor and back slightly arched.",
        ],
        "contradictions": ["shoulder impingement", "rotator cuff injury"],
    },
    {
        "name": "Dumbbell Flyes",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["chest", "shoulders"],
        "equipment": ["dumbbells", "bench"],
        "instructions": [
            "Lie on a flat bench holding dumbbells above your chest with a slight elbow bend.",
            "Lower the dumbbells out to the sides in a wide arc.",
            "Squeeze your chest to bring the dumbbells back together at the top.",
        ],
        "contradictions": ["shoulder instability"],
    },
    {
        "name": "Push-up",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["chest", "triceps", "core"],
        "equipment": [],
        "instructions": [
            "Start in a high plank position with hands slightly wider than shoulder-width.",
            "Lower your chest to the floor, keeping your body in a straight line.",
            "Push back up to the starting position.",
        ],
        "contradictions": ["wrist pain"],
    },
    {
        "name": "Incline Push-up",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["chest", "triceps"],
        "equipment": [],
        "instructions": [
            "Place hands on an elevated surface (bench or wall), wider than shoulder-width.",
            "Lower your chest toward the surface.",
            "Push back to start.",
        ],
        "contradictions": [],
    },
    {
        "name": "Diamond Push-up",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["triceps", "chest"],
        "equipment": [],
        "instructions": [
            "Form a diamond shape with your hands directly under your chest.",
            "Lower your chest to your hands while keeping elbows close to your body.",
            "Press back up to full arm extension.",
        ],
        "contradictions": ["wrist pain", "elbow tendinitis"],
    },
    {
        "name": "Decline Dumbbell Press",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["chest", "triceps"],
        "equipment": ["dumbbells", "decline bench"],
        "instructions": [
            "Lie on a decline bench with dumbbells held at chest level.",
            "Press the dumbbells upward and slightly inward.",
            "Lower slowly back to chest level.",
        ],
        "contradictions": ["lower back pain"],
    },
    # Back
    {
        "name": "Pull-up",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["back", "biceps"],
        "equipment": ["pull-up bar"],
        "instructions": [
            "Hang from a bar with an overhand grip, hands shoulder-width apart.",
            "Pull your chest up to the bar by driving your elbows down.",
            "Lower yourself with control back to full arm extension.",
        ],
        "contradictions": ["shoulder impingement"],
    },
    {
        "name": "Chin-up",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["biceps", "back"],
        "equipment": ["pull-up bar"],
        "instructions": [
            "Hang from a bar with an underhand grip, hands shoulder-width apart.",
            "Pull your chin above the bar by bending your elbows.",
            "Lower slowly back to the starting position.",
        ],
        "contradictions": ["elbow tendinitis"],
    },
    {
        "name": "Barbell Deadlift",
        "category": "strength",
        "difficulty": "advanced",
        "muscle_group": ["back", "glutes", "hamstrings", "core"],
        "equipment": ["barbell"],
        "instructions": [
            "Stand with feet hip-width apart, bar over mid-foot.",
            "Hinge at the hips and grip the bar just outside your legs.",
            "Drive through your heels and extend hips and knees simultaneously to lift.",
            "Lock out at the top, then hinge back down with control.",
        ],
        "contradictions": ["lower back injury", "herniated disc"],
    },
    {
        "name": "Dumbbell Row",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["back", "biceps"],
        "equipment": ["dumbbells"],
        "instructions": [
            "Place one knee and hand on a bench for support.",
            "Hold a dumbbell in the opposite hand with arm extended.",
            "Row the dumbbell up to your hip, keeping your elbow close.",
            "Lower with control and repeat.",
        ],
        "contradictions": [],
    },
    {
        "name": "Inverted Row",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["back", "biceps", "core"],
        "equipment": ["barbell", "table"],
        "instructions": [
            "Set a bar at hip height and lie beneath it.",
            "Grip the bar with an overhand grip and hang with straight arms.",
            "Pull your chest up to the bar by squeezing your shoulder blades.",
            "Lower back down with control.",
        ],
        "contradictions": [],
    },
    {
        "name": "Superman Hold",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["lower back", "glutes"],
        "equipment": [],
        "instructions": [
            "Lie face down with arms extended overhead.",
            "Simultaneously lift your arms, chest, and legs off the floor.",
            "Hold the position for 2–3 seconds, then lower.",
        ],
        "contradictions": ["lower back injury"],
    },
    # Shoulders
    {
        "name": "Overhead Press",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["shoulders", "triceps"],
        "equipment": ["barbell"],
        "instructions": [
            "Stand with the barbell at shoulder height, grip just outside shoulder-width.",
            "Press the bar directly overhead until arms are fully extended.",
            "Lower the bar back to shoulder height with control.",
        ],
        "contradictions": ["shoulder impingement", "rotator cuff injury"],
    },
    {
        "name": "Dumbbell Lateral Raise",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["shoulders"],
        "equipment": ["dumbbells"],
        "instructions": [
            "Stand holding dumbbells at your sides with a slight elbow bend.",
            "Raise both arms out to the sides until parallel to the floor.",
            "Lower slowly back to starting position.",
        ],
        "contradictions": ["shoulder impingement"],
    },
    {
        "name": "Arnold Press",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["shoulders", "triceps"],
        "equipment": ["dumbbells"],
        "instructions": [
            "Hold dumbbells at chin level with palms facing you.",
            "Press up while rotating your palms to face forward.",
            "Reverse the motion as you lower back to start.",
        ],
        "contradictions": ["shoulder instability"],
    },
    {
        "name": "Pike Push-up",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["shoulders", "triceps"],
        "equipment": [],
        "instructions": [
            "Start in a downward dog position with hips high.",
            "Bend your elbows and lower the top of your head toward the floor.",
            "Press back up to the pike position.",
        ],
        "contradictions": ["wrist pain"],
    },
    {
        "name": "Face Pull",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["shoulders", "upper back"],
        "equipment": ["resistance band"],
        "instructions": [
            "Anchor a resistance band at face height.",
            "Pull the band toward your face while flaring your elbows out.",
            "Squeeze your rear delts, then return to start.",
        ],
        "contradictions": [],
    },
    # Legs
    {
        "name": "Barbell Back Squat",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["quads", "glutes", "hamstrings", "core"],
        "equipment": ["barbell"],
        "instructions": [
            "Position the barbell across your upper back and step out from the rack.",
            "Stand with feet shoulder-width apart, toes slightly out.",
            "Lower by pushing hips back and bending knees until thighs are parallel.",
            "Drive through your heels to stand back up.",
        ],
        "contradictions": ["knee injury", "lower back injury"],
    },
    {
        "name": "Goblet Squat",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["quads", "glutes", "core"],
        "equipment": ["dumbbell", "kettlebell"],
        "instructions": [
            "Hold a dumbbell vertically at your chest.",
            "Stand with feet shoulder-width apart.",
            "Squat down keeping your chest up and elbows inside your knees.",
            "Stand back up to starting position.",
        ],
        "contradictions": [],
    },
    {
        "name": "Bodyweight Squat",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["quads", "glutes"],
        "equipment": [],
        "instructions": [
            "Stand with feet shoulder-width apart.",
            "Lower your hips back and down until thighs are parallel to the floor.",
            "Drive through your heels to return to standing.",
        ],
        "contradictions": [],
    },
    {
        "name": "Walking Lunge",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["quads", "glutes", "hamstrings"],
        "equipment": [],
        "instructions": [
            "Stand tall and step forward with one leg.",
            "Lower your back knee toward the floor.",
            "Push off the front foot and step forward with the opposite leg.",
            "Continue alternating for the set distance.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Bulgarian Split Squat",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["quads", "glutes"],
        "equipment": ["bench"],
        "instructions": [
            "Place one foot elevated behind you on a bench.",
            "Lower your back knee toward the floor by bending the front knee.",
            "Drive through the front heel to return to start.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Romanian Deadlift",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["hamstrings", "glutes", "lower back"],
        "equipment": ["barbell", "dumbbells"],
        "instructions": [
            "Hold the bar at hip level with a shoulder-width grip.",
            "Hinge at the hips, pushing them back while keeping the back flat.",
            "Lower the bar along your legs until you feel a hamstring stretch.",
            "Drive hips forward to return to standing.",
        ],
        "contradictions": ["lower back injury"],
    },
    {
        "name": "Calf Raise",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["calves"],
        "equipment": [],
        "instructions": [
            "Stand with feet hip-width apart.",
            "Rise up onto the balls of your feet as high as possible.",
            "Lower slowly back to the floor.",
        ],
        "contradictions": [],
    },
    # Arms
    {
        "name": "Barbell Bicep Curl",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["biceps"],
        "equipment": ["barbell"],
        "instructions": [
            "Stand holding a barbell with an underhand grip, arms extended.",
            "Curl the bar up to shoulder height by flexing your biceps.",
            "Lower slowly back to full extension.",
        ],
        "contradictions": ["elbow tendinitis"],
    },
    {
        "name": "Hammer Curl",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["biceps", "forearms"],
        "equipment": ["dumbbells"],
        "instructions": [
            "Hold dumbbells at your sides with a neutral (hammer) grip.",
            "Curl the dumbbells up to shoulder height.",
            "Lower slowly back down.",
        ],
        "contradictions": [],
    },
    {
        "name": "Tricep Dip",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["triceps", "chest"],
        "equipment": ["parallel bars", "chair"],
        "instructions": [
            "Support yourself on parallel bars or the edge of a chair.",
            "Lower your body by bending your elbows to about 90 degrees.",
            "Press back up to full arm extension.",
        ],
        "contradictions": ["shoulder impingement"],
    },
    {
        "name": "Skull Crusher",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["triceps"],
        "equipment": ["barbell", "bench"],
        "instructions": [
            "Lie on a bench holding a barbell with arms extended above your chest.",
            "Bend your elbows to lower the bar toward your forehead.",
            "Extend your arms to press the bar back to start.",
        ],
        "contradictions": ["elbow tendinitis"],
    },
    {
        "name": "Close-Grip Push-up",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["triceps", "chest"],
        "equipment": [],
        "instructions": [
            "Start in push-up position with hands directly under your shoulders.",
            "Lower your chest keeping elbows tucked close to your body.",
            "Push back up to full extension.",
        ],
        "contradictions": ["wrist pain"],
    },
    # Core
    {
        "name": "Plank",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["core", "shoulders"],
        "equipment": [],
        "instructions": [
            "Start in a forearm plank with elbows under shoulders.",
            "Keep your body in a straight line from head to heels.",
            "Hold the position while breathing steadily.",
        ],
        "contradictions": ["wrist pain"],
    },
    {
        "name": "Side Plank",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["obliques", "core"],
        "equipment": [],
        "instructions": [
            "Lie on your side and prop yourself up on one forearm.",
            "Stack your feet and lift your hips to create a straight line.",
            "Hold the position, then switch sides.",
        ],
        "contradictions": ["shoulder injury"],
    },
    {
        "name": "Hollow Body Hold",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["core"],
        "equipment": [],
        "instructions": [
            "Lie on your back and press your lower back into the floor.",
            "Lift your legs and shoulders slightly off the ground.",
            "Extend your arms overhead and hold the hollow position.",
        ],
        "contradictions": ["lower back injury"],
    },
    {
        "name": "Hanging Leg Raise",
        "category": "strength",
        "difficulty": "intermediate",
        "muscle_group": ["core", "hip flexors"],
        "equipment": ["pull-up bar"],
        "instructions": [
            "Hang from a bar with arms extended.",
            "Raise your legs to hip height or higher by engaging your core.",
            "Lower slowly back to the hanging position.",
        ],
        "contradictions": ["shoulder injury"],
    },
    {
        "name": "Ab Wheel Rollout",
        "category": "strength",
        "difficulty": "advanced",
        "muscle_group": ["core", "shoulders"],
        "equipment": ["ab wheel"],
        "instructions": [
            "Kneel on the floor and grip the ab wheel.",
            "Roll forward slowly until your body is nearly parallel to the floor.",
            "Contract your core to roll back to the starting position.",
        ],
        "contradictions": ["lower back injury", "wrist pain"],
    },
    {
        "name": "Russian Twist",
        "category": "strength",
        "difficulty": "beginner",
        "muscle_group": ["obliques", "core"],
        "equipment": [],
        "instructions": [
            "Sit on the floor with knees bent and feet lifted slightly.",
            "Lean back slightly and clasp your hands in front of you.",
            "Rotate your torso from side to side.",
        ],
        "contradictions": ["lower back injury"],
    },
    # ------------------------------------------------------------------ CARDIO
    # Full Body / HIIT
    {
        "name": "Burpee",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["full body"],
        "equipment": [],
        "instructions": [
            "Stand with feet shoulder-width apart.",
            "Drop into a squat and place your hands on the floor.",
            "Jump your feet back into a push-up position.",
            "Perform a push-up, then jump feet forward and explosively jump up.",
        ],
        "contradictions": ["knee injury", "wrist pain"],
    },
    {
        "name": "Jumping Jack",
        "category": "cardio",
        "difficulty": "beginner",
        "muscle_group": ["full body"],
        "equipment": [],
        "instructions": [
            "Stand with feet together and arms at your sides.",
            "Jump your feet out wide while raising your arms overhead.",
            "Jump back to starting position and repeat.",
        ],
        "contradictions": [],
    },
    {
        "name": "Mountain Climber",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["core", "shoulders", "hip flexors"],
        "equipment": [],
        "instructions": [
            "Start in a high plank position.",
            "Drive one knee toward your chest, then quickly switch legs.",
            "Alternate as fast as possible while keeping hips level.",
        ],
        "contradictions": ["wrist pain"],
    },
    {
        "name": "High Knees",
        "category": "cardio",
        "difficulty": "beginner",
        "muscle_group": ["hip flexors", "core", "quads"],
        "equipment": [],
        "instructions": [
            "Stand tall and run in place.",
            "Drive each knee up to hip height with each step.",
            "Pump your arms in sync with your legs.",
        ],
        "contradictions": [],
    },
    {
        "name": "Squat Jump",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["quads", "glutes", "calves"],
        "equipment": [],
        "instructions": [
            "Stand with feet shoulder-width apart.",
            "Perform a squat, then explode upward into a jump.",
            "Land softly with knees slightly bent and immediately repeat.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Box Jump",
        "category": "cardio",
        "difficulty": "advanced",
        "muscle_group": ["quads", "glutes", "calves"],
        "equipment": ["box", "step"],
        "instructions": [
            "Stand facing a sturdy box.",
            "Bend into a quarter squat and swing arms back.",
            "Explode upward and land softly on top of the box.",
            "Step back down and repeat.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Tuck Jump",
        "category": "cardio",
        "difficulty": "advanced",
        "muscle_group": ["quads", "calves", "core"],
        "equipment": [],
        "instructions": [
            "Stand with feet shoulder-width apart.",
            "Jump up and pull your knees to your chest.",
            "Land softly and immediately repeat.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Bear Crawl",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["shoulders", "core", "quads"],
        "equipment": [],
        "instructions": [
            "Start on all fours with knees hovering an inch off the floor.",
            "Move your right hand and left foot forward simultaneously.",
            "Then move your left hand and right foot forward.",
            "Continue crawling forward for the set distance.",
        ],
        "contradictions": ["wrist pain", "knee pain"],
    },
    # Lower Body Plyometrics
    {
        "name": "Lateral Bound",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["glutes", "quads", "calves"],
        "equipment": [],
        "instructions": [
            "Stand on one foot with a slight bend in the knee.",
            "Push off laterally and land on the opposite foot.",
            "Absorb the landing and immediately bound back.",
        ],
        "contradictions": ["ankle instability"],
    },
    {
        "name": "Broad Jump",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["quads", "glutes", "calves"],
        "equipment": [],
        "instructions": [
            "Stand with feet shoulder-width apart.",
            "Swing arms back and bend into a squat.",
            "Explode forward as far as possible and land softly.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Single-Leg Hop",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["calves", "quads", "glutes"],
        "equipment": [],
        "instructions": [
            "Stand on one foot.",
            "Hop forward, sideways, or in place on that same foot.",
            "Maintain balance and control on each landing.",
        ],
        "contradictions": ["ankle instability"],
    },
    {
        "name": "Step-up",
        "category": "cardio",
        "difficulty": "beginner",
        "muscle_group": ["quads", "glutes"],
        "equipment": ["box", "bench"],
        "instructions": [
            "Stand in front of a box or bench.",
            "Step up with one foot and bring the other to meet it.",
            "Step back down and alternate the leading leg.",
        ],
        "contradictions": [],
    },
    {
        "name": "Skater Jump",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["glutes", "quads", "calves"],
        "equipment": [],
        "instructions": [
            "Stand on one foot.",
            "Leap sideways to land on the opposite foot, swinging the trail leg behind.",
            "Alternate side to side in a skating motion.",
        ],
        "contradictions": ["knee injury"],
    },
    # Upper Body Cardio
    {
        "name": "Battle Rope Wave",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["shoulders", "arms", "core"],
        "equipment": ["battle ropes"],
        "instructions": [
            "Hold one end of the battle rope in each hand.",
            "Alternate raising and lowering each arm rapidly to create waves.",
            "Keep your core tight and knees slightly bent.",
        ],
        "contradictions": ["shoulder injury"],
    },
    {
        "name": "Medicine Ball Slam",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["core", "shoulders", "back"],
        "equipment": ["medicine ball"],
        "instructions": [
            "Stand with feet shoulder-width apart holding a medicine ball overhead.",
            "Slam the ball into the floor as hard as possible.",
            "Catch or pick up the ball and repeat.",
        ],
        "contradictions": [],
    },
    {
        "name": "Rope Jump Double Under",
        "category": "cardio",
        "difficulty": "advanced",
        "muscle_group": ["calves", "shoulders", "core"],
        "equipment": ["jump rope"],
        "instructions": [
            "Hold the jump rope handles and begin jumping.",
            "Swing the rope fast enough to pass under your feet twice per jump.",
            "Keep a tight core and land on the balls of your feet.",
        ],
        "contradictions": ["ankle instability"],
    },
    {
        "name": "Rope Jump Basic",
        "category": "cardio",
        "difficulty": "beginner",
        "muscle_group": ["calves", "shoulders"],
        "equipment": ["jump rope"],
        "instructions": [
            "Hold the rope handles and swing the rope over your head.",
            "Jump over the rope as it passes under your feet.",
            "Maintain a steady rhythm and land softly.",
        ],
        "contradictions": [],
    },
    # Steady-State / Endurance
    {
        "name": "Running in Place",
        "category": "cardio",
        "difficulty": "beginner",
        "muscle_group": ["quads", "calves", "core"],
        "equipment": [],
        "instructions": [
            "Stand tall and begin jogging in place.",
            "Drive your knees up and pump your arms.",
            "Maintain a consistent pace for the set duration.",
        ],
        "contradictions": [],
    },
    {
        "name": "Stair Climb",
        "category": "cardio",
        "difficulty": "beginner",
        "muscle_group": ["quads", "glutes", "calves"],
        "equipment": ["stairs"],
        "instructions": [
            "Find a set of stairs and walk or jog up at a steady pace.",
            "Walk back down and repeat.",
            "Keep your chest up and use the full step.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Rowing Machine Sprint",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["back", "arms", "legs", "core"],
        "equipment": ["rowing machine"],
        "instructions": [
            "Sit on the rowing machine and secure your feet.",
            "Drive with your legs, then lean back and pull the handle to your lower chest.",
            "Reverse the motion and repeat at a sprint pace.",
        ],
        "contradictions": ["lower back injury"],
    },
    {
        "name": "Cycling Sprint",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["quads", "glutes", "calves"],
        "equipment": ["bike", "stationary bike"],
        "instructions": [
            "Mount the bike and adjust seat height.",
            "Pedal at maximum effort for the sprint interval.",
            "Recover at a slow pace between sprints.",
        ],
        "contradictions": ["knee pain"],
    },
    # Core Cardio
    {
        "name": "Flutter Kick",
        "category": "cardio",
        "difficulty": "beginner",
        "muscle_group": ["core", "hip flexors"],
        "equipment": [],
        "instructions": [
            "Lie on your back with hands under your lower back.",
            "Lift both legs a few inches off the floor.",
            "Alternate kicking legs up and down in a fluttering motion.",
        ],
        "contradictions": ["lower back injury"],
    },
    {
        "name": "Scissor Kick",
        "category": "cardio",
        "difficulty": "beginner",
        "muscle_group": ["core", "hip flexors"],
        "equipment": [],
        "instructions": [
            "Lie on your back and lift both legs off the floor.",
            "Cross your legs over each other alternately in a scissor pattern.",
            "Keep your core engaged and lower back pressed to the floor.",
        ],
        "contradictions": ["lower back injury"],
    },
    {
        "name": "Bicycle Crunch",
        "category": "cardio",
        "difficulty": "beginner",
        "muscle_group": ["obliques", "core"],
        "equipment": [],
        "instructions": [
            "Lie on your back with hands behind your head.",
            "Bring one knee toward your chest while rotating your opposite elbow toward it.",
            "Alternate sides in a pedaling motion.",
        ],
        "contradictions": ["neck pain"],
    },
    {
        "name": "V-Up",
        "category": "cardio",
        "difficulty": "intermediate",
        "muscle_group": ["core", "hip flexors"],
        "equipment": [],
        "instructions": [
            "Lie flat on your back with arms extended overhead.",
            "Simultaneously lift your legs and torso to form a V shape.",
            "Lower back down with control and repeat.",
        ],
        "contradictions": ["lower back injury"],
    },
    # ------------------------------------------------------------------ YOGA
    # Standing Poses
    {
        "name": "Warrior I",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["quads", "hip flexors", "shoulders"],
        "equipment": [],
        "instructions": [
            "Step one foot forward into a deep lunge.",
            "Square your hips toward the front and raise your arms overhead.",
            "Hold for 5 breaths, then switch sides.",
        ],
        "contradictions": ["hip injury"],
    },
    {
        "name": "Warrior II",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["quads", "glutes", "shoulders"],
        "equipment": [],
        "instructions": [
            "Step feet wide apart and turn one foot out 90 degrees.",
            "Bend the front knee over the ankle and extend arms parallel to the floor.",
            "Gaze over your front hand and hold for 5 breaths.",
        ],
        "contradictions": [],
    },
    {
        "name": "Warrior III",
        "category": "yoga",
        "difficulty": "intermediate",
        "muscle_group": ["glutes", "hamstrings", "core"],
        "equipment": [],
        "instructions": [
            "Stand on one leg and hinge forward at the hip.",
            "Extend the back leg and arms forward until your body is parallel to the floor.",
            "Hold for 3–5 breaths, then switch sides.",
        ],
        "contradictions": ["ankle instability"],
    },
    {
        "name": "Tree Pose",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["core", "glutes", "ankles"],
        "equipment": [],
        "instructions": [
            "Stand tall and shift weight onto one foot.",
            "Place the sole of the other foot on your inner calf or thigh.",
            "Bring your hands to prayer position and balance for 5 breaths.",
        ],
        "contradictions": ["ankle instability"],
    },
    {
        "name": "Chair Pose",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["quads", "glutes", "core"],
        "equipment": [],
        "instructions": [
            "Stand with feet together.",
            "Bend your knees as if sitting into a chair and raise your arms overhead.",
            "Hold for 5 breaths.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Triangle Pose",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["hamstrings", "obliques", "shoulders"],
        "equipment": [],
        "instructions": [
            "Stand with feet wide apart and one foot turned out 90 degrees.",
            "Extend arms out and reach the front hand down toward the shin or floor.",
            "Stack the hips and look up at the top hand.",
        ],
        "contradictions": [],
    },
    # Forward Folds & Hip Openers
    {
        "name": "Downward Dog",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["hamstrings", "calves", "shoulders", "back"],
        "equipment": [],
        "instructions": [
            "Start on all fours with wrists under shoulders.",
            "Lift your hips up and back to form an inverted V.",
            "Press your heels toward the floor and hold for 5 breaths.",
        ],
        "contradictions": ["wrist pain", "shoulder injury"],
    },
    {
        "name": "Standing Forward Fold",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["hamstrings", "lower back"],
        "equipment": [],
        "instructions": [
            "Stand with feet hip-width apart.",
            "Hinge at the hips and fold forward, letting the upper body hang.",
            "Hold opposite elbows or let hands rest on the floor.",
        ],
        "contradictions": ["lower back injury"],
    },
    {
        "name": "Seated Forward Fold",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["hamstrings", "lower back"],
        "equipment": [],
        "instructions": [
            "Sit with legs extended straight in front of you.",
            "Inhale to lengthen the spine, then exhale and fold forward.",
            "Reach for your feet or shins and hold for 5 breaths.",
        ],
        "contradictions": ["lower back injury"],
    },
    {
        "name": "Pigeon Pose",
        "category": "yoga",
        "difficulty": "intermediate",
        "muscle_group": ["hip flexors", "glutes", "piriformis"],
        "equipment": [],
        "instructions": [
            "From downward dog, bring one knee forward and place it behind your wrist.",
            "Extend the back leg straight and lower your hips toward the floor.",
            "Fold forward over the front leg and hold for 5–10 breaths.",
        ],
        "contradictions": ["knee injury", "hip injury"],
    },
    {
        "name": "Low Lunge",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["hip flexors", "quads"],
        "equipment": [],
        "instructions": [
            "Step one foot forward into a lunge and lower the back knee to the floor.",
            "Raise your arms overhead and sink your hips down.",
            "Hold for 5 breaths and switch sides.",
        ],
        "contradictions": ["knee pain"],
    },
    # Backbends
    {
        "name": "Cobra Pose",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["lower back", "chest", "shoulders"],
        "equipment": [],
        "instructions": [
            "Lie face down with palms under your shoulders.",
            "Press into your hands and lift your chest off the floor.",
            "Keep your elbows slightly bent and hold for 5 breaths.",
        ],
        "contradictions": ["lower back injury"],
    },
    {
        "name": "Upward Dog",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["chest", "lower back", "shoulders"],
        "equipment": [],
        "instructions": [
            "Lie face down and place palms near your lower ribs.",
            "Straighten your arms and lift your thighs off the floor.",
            "Open your chest and look forward for 3–5 breaths.",
        ],
        "contradictions": ["lower back injury", "wrist pain"],
    },
    {
        "name": "Camel Pose",
        "category": "yoga",
        "difficulty": "intermediate",
        "muscle_group": ["chest", "hip flexors", "lower back"],
        "equipment": [],
        "instructions": [
            "Kneel with knees hip-width apart.",
            "Place hands on your lower back and lean back, opening your chest.",
            "Reach back for your heels if accessible and hold for 3–5 breaths.",
        ],
        "contradictions": ["lower back injury", "neck injury"],
    },
    {
        "name": "Bridge Pose",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["glutes", "hamstrings", "lower back"],
        "equipment": [],
        "instructions": [
            "Lie on your back with knees bent and feet flat on the floor.",
            "Press through your feet to lift your hips toward the ceiling.",
            "Clasp your hands under your back and hold for 5 breaths.",
        ],
        "contradictions": ["neck injury"],
    },
    # Twists
    {
        "name": "Seated Spinal Twist",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["obliques", "back", "hips"],
        "equipment": [],
        "instructions": [
            "Sit with legs extended. Bend one knee and place the foot outside the opposite thigh.",
            "Wrap the opposite arm around the bent knee.",
            "Twist toward the bent knee and hold for 5 breaths. Switch sides.",
        ],
        "contradictions": ["spinal disc injury"],
    },
    {
        "name": "Supine Twist",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["obliques", "lower back"],
        "equipment": [],
        "instructions": [
            "Lie on your back and hug one knee to your chest.",
            "Guide that knee across your body while keeping shoulders on the floor.",
            "Look in the opposite direction and hold for 5 breaths.",
        ],
        "contradictions": ["lower back injury"],
    },
    {
        "name": "Revolved Triangle",
        "category": "yoga",
        "difficulty": "intermediate",
        "muscle_group": ["hamstrings", "obliques", "back"],
        "equipment": [],
        "instructions": [
            "Stand in a wide stance with one foot forward.",
            "Rotate your torso to bring the opposite hand to the front foot.",
            "Extend the other arm up and gaze upward. Hold for 5 breaths.",
        ],
        "contradictions": ["lower back injury"],
    },
    # Inversions & Balance
    {
        "name": "Crow Pose",
        "category": "yoga",
        "difficulty": "advanced",
        "muscle_group": ["core", "shoulders", "wrists"],
        "equipment": [],
        "instructions": [
            "Squat low and place your palms on the floor shoulder-width apart.",
            "Place your knees on the backs of your upper arms.",
            "Shift your weight forward until your feet lift off the floor.",
            "Hold for 3–5 breaths.",
        ],
        "contradictions": ["wrist injury"],
    },
    {
        "name": "Headstand",
        "category": "yoga",
        "difficulty": "advanced",
        "muscle_group": ["core", "shoulders", "neck"],
        "equipment": [],
        "instructions": [
            "Interlace fingers on the floor and place your head in your hands.",
            "Lift your hips and walk your feet toward your head.",
            "Lift both legs up and straighten into a full inversion.",
            "Hold for 5–10 breaths with a spotter if needed.",
        ],
        "contradictions": ["neck injury", "high blood pressure"],
    },
    {
        "name": "Shoulder Stand",
        "category": "yoga",
        "difficulty": "intermediate",
        "muscle_group": ["core", "legs", "neck"],
        "equipment": [],
        "instructions": [
            "Lie on your back and lift your legs overhead.",
            "Support your lower back with your hands and straighten your legs toward the ceiling.",
            "Hold for 5–10 breaths.",
        ],
        "contradictions": ["neck injury", "high blood pressure"],
    },
    {
        "name": "Dolphin Pose",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["shoulders", "hamstrings", "core"],
        "equipment": [],
        "instructions": [
            "Start on forearms and knees.",
            "Lift your hips to form an inverted V on your forearms.",
            "Hold for 5 breaths, walking feet closer as flexibility allows.",
        ],
        "contradictions": ["shoulder injury"],
    },
    # Restorative / Floor
    {
        "name": "Child's Pose",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["lower back", "hips"],
        "equipment": [],
        "instructions": [
            "Kneel and sit your hips back toward your heels.",
            "Extend your arms forward on the floor.",
            "Rest your forehead on the mat and breathe deeply.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Legs Up the Wall",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["hamstrings", "lower back"],
        "equipment": [],
        "instructions": [
            "Sit sideways against a wall and swing your legs up.",
            "Lie on your back with legs resting against the wall.",
            "Hold for 5–10 minutes breathing deeply.",
        ],
        "contradictions": [],
    },
    {
        "name": "Corpse Pose",
        "category": "yoga",
        "difficulty": "beginner",
        "muscle_group": ["full body"],
        "equipment": [],
        "instructions": [
            "Lie flat on your back with arms at your sides, palms up.",
            "Close your eyes and relax every muscle.",
            "Hold for 5–15 minutes.",
        ],
        "contradictions": [],
    },
    # ------------------------------------------------------------------ DANCE
    # Latin
    {
        "name": "Basic Salsa Step",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["legs", "hips", "core"],
        "equipment": [],
        "instructions": [
            "Step forward with your left foot on beat 1.",
            "Shift weight to the right on beat 2.",
            "Bring left foot back on beat 3, then pause.",
            "Repeat mirrored on the right side.",
        ],
        "contradictions": [],
    },
    {
        "name": "Cumbia Step",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["legs", "hips"],
        "equipment": [],
        "instructions": [
            "Stand with feet together.",
            "Step to the side with your right foot, then bring the left to meet it.",
            "Add a hip sway with each step.",
            "Repeat to both sides.",
        ],
        "contradictions": [],
    },
    {
        "name": "Cha-Cha Basic",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["legs", "hips", "core"],
        "equipment": [],
        "instructions": [
            "Step forward with your left foot.",
            "Shift weight back to the right, then do three quick steps: right, left, right.",
            "Step back with the left and repeat.",
        ],
        "contradictions": [],
    },
    {
        "name": "Merengue March",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["legs", "hips"],
        "equipment": [],
        "instructions": [
            "March in place lifting knees alternately.",
            "Add a side-to-side hip sway on each step.",
            "Keep your upper body relaxed and arms swinging naturally.",
        ],
        "contradictions": [],
    },
    # Hip-Hop / Urban
    {
        "name": "Body Roll",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["core", "back", "hips"],
        "equipment": [],
        "instructions": [
            "Stand with feet shoulder-width apart.",
            "Begin a wave motion from your head, through chest, belly, and hips.",
            "Reverse the wave back up.",
        ],
        "contradictions": [],
    },
    {
        "name": "Hip Shake",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["hips", "glutes", "core"],
        "equipment": [],
        "instructions": [
            "Stand with feet shoulder-width apart and knees slightly bent.",
            "Shift hips rapidly from side to side.",
            "Keep your upper body relaxed.",
        ],
        "contradictions": [],
    },
    {
        "name": "Running Man Step",
        "category": "dance",
        "difficulty": "intermediate",
        "muscle_group": ["legs", "core", "hips"],
        "equipment": [],
        "instructions": [
            "Step forward with one foot while the other kicks back.",
            "Alternate legs in a running-in-place illusion.",
            "Add arm swings for rhythm.",
        ],
        "contradictions": [],
    },
    {
        "name": "Groove Step",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["legs", "hips"],
        "equipment": [],
        "instructions": [
            "Step side to side while bending knees and bouncing to the beat.",
            "Add shoulder rolls and arm movements.",
            "Let the body groove naturally with the music.",
        ],
        "contradictions": [],
    },
    {
        "name": "Bounce and Pump",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["legs", "core"],
        "equipment": [],
        "instructions": [
            "Stand with feet shoulder-width apart.",
            "Bend knees in a bouncing rhythm.",
            "Pump your arms up and down with each bounce.",
        ],
        "contradictions": ["knee injury"],
    },
    # Cardio Dance / Zumba
    {
        "name": "Reggaeton Squat Pulse",
        "category": "dance",
        "difficulty": "intermediate",
        "muscle_group": ["quads", "glutes", "hips"],
        "equipment": [],
        "instructions": [
            "Stand with feet wider than hip-width.",
            "Lower into a squat and pulse up and down to the beat.",
            "Add hip circles or a forward body lean for style.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Cumbia Lateral Step",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["legs", "hips", "core"],
        "equipment": [],
        "instructions": [
            "Step to the right with your right foot, bringing the left to tap beside it.",
            "Step to the left with the left foot, bringing the right to tap.",
            "Add a forward lean and hip accent on each step.",
        ],
        "contradictions": [],
    },
    {
        "name": "Zumba Sumo Squat",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["quads", "glutes", "inner thighs"],
        "equipment": [],
        "instructions": [
            "Stand with feet wide and toes turned out.",
            "Lower into a sumo squat, then rise and step feet together.",
            "Repeat with exaggerated hip movements to the beat.",
        ],
        "contradictions": ["knee injury"],
    },
    {
        "name": "Samba Step",
        "category": "dance",
        "difficulty": "intermediate",
        "muscle_group": ["legs", "hips", "core"],
        "equipment": [],
        "instructions": [
            "Step to the right, bring the left foot to tap, then step right again.",
            "Reverse: step left, tap right, step left.",
            "Add a downward bounce on each triple step.",
        ],
        "contradictions": [],
    },
    # Contemporary / Freestyle
    {
        "name": "Arm Wave",
        "category": "dance",
        "difficulty": "beginner",
        "muscle_group": ["shoulders", "arms"],
        "equipment": [],
        "instructions": [
            "Raise one arm to the side.",
            "Create a wave motion from your fingertips through shoulder, chest, and out the other arm.",
            "Keep the motion fluid and continuous.",
        ],
        "contradictions": ["shoulder injury"],
    },
    {
        "name": "Floor Slide",
        "category": "dance",
        "difficulty": "intermediate",
        "muscle_group": ["core", "legs", "hips"],
        "equipment": [],
        "instructions": [
            "Lower your body toward the floor by bending one knee.",
            "Slide smoothly to the side or forward close to the floor.",
            "Rise back up fluidly and repeat.",
        ],
        "contradictions": ["knee injury"],
    },
]


# ---------------------------------------------------------------------------
# Workout plan definitions
# ---------------------------------------------------------------------------

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _make_plan(name, plan_type, level, duration_weeks=None, price=None):
    return {
        "name": name,
        "plan_type": plan_type,
        "level": level,
        "duration_weeks": duration_weeks,
        "price": price or 0.0,
        "image_url": image_url(name),
        "video_url": VIDEO_BY_CATEGORY["plan"],
        "description": f"{name} — a {level} level {plan_type} program.",
        "is_active": True,
    }


WORKOUT_PLANS_DATA = [
    # ---- LIBRARY (one-day, 10 plans) ----
    {
        **_make_plan("Full Body Strength Starter", "library", "beginner"),
        "days": [
            {"exercises": ["Bodyweight Squat", "Push-up", "Plank", "Dumbbell Row", "Calf Raise"]}
        ],
    },
    {
        **_make_plan("Upper Body Blast", "library", "intermediate"),
        "days": [
            {
                "exercises": [
                    "Barbell Bench Press",
                    "Pull-up",
                    "Overhead Press",
                    "Barbell Bicep Curl",
                    "Tricep Dip",
                ]
            }
        ],
    },
    {
        **_make_plan("Leg Day Fundamentals", "library", "beginner"),
        "days": [
            {
                "exercises": [
                    "Goblet Squat",
                    "Walking Lunge",
                    "Calf Raise",
                    "Romanian Deadlift",
                    "Side Plank",
                ]
            }
        ],
    },
    {
        **_make_plan("Core and Abs Burn", "library", "beginner"),
        "days": [
            {"exercises": ["Plank", "Hollow Body Hold", "Russian Twist", "Bicycle Crunch", "V-Up"]}
        ],
    },
    {
        **_make_plan("HIIT Cardio Blast", "library", "intermediate"),
        "days": [
            {
                "exercises": [
                    "Burpee",
                    "Mountain Climber",
                    "Squat Jump",
                    "High Knees",
                    "Jumping Jack",
                ]
            }
        ],
    },
    {
        **_make_plan("Plyometric Power", "library", "advanced"),
        "days": [
            {
                "exercises": [
                    "Box Jump",
                    "Tuck Jump",
                    "Lateral Bound",
                    "Broad Jump",
                    "Battle Rope Wave",
                ]
            }
        ],
    },
    {
        **_make_plan("Morning Yoga Flow", "library", "beginner"),
        "days": [
            {
                "exercises": [
                    "Downward Dog",
                    "Cobra Pose",
                    "Child's Pose",
                    "Warrior I",
                    "Seated Forward Fold",
                ]
            }
        ],
    },
    {
        **_make_plan("Hip Opener and Flexibility", "library", "intermediate"),
        "days": [
            {
                "exercises": [
                    "Pigeon Pose",
                    "Low Lunge",
                    "Triangle Pose",
                    "Supine Twist",
                    "Bridge Pose",
                ]
            }
        ],
    },
    {
        **_make_plan("Latin Dance Cardio", "library", "beginner"),
        "days": [
            {
                "exercises": [
                    "Basic Salsa Step",
                    "Cumbia Step",
                    "Cha-Cha Basic",
                    "Merengue March",
                    "Reggaeton Squat Pulse",
                ]
            }
        ],
    },
    {
        **_make_plan("Urban Dance Burn", "library", "intermediate"),
        "days": [
            {
                "exercises": [
                    "Body Roll",
                    "Running Man Step",
                    "Bounce and Pump",
                    "Samba Step",
                    "Hip Shake",
                ]
            }
        ],
    },
    # ---- PAID (multi-week, 5 plans) ----
    {
        **_make_plan(
            "Hypertrophy Mastery Program", "paid", "intermediate", duration_weeks=8, price=29.99
        ),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": [
                    "Barbell Bench Press",
                    "Dumbbell Flyes",
                    "Diamond Push-up",
                    "Tricep Dip",
                    "Skull Crusher",
                ],
            },
            {
                "day_of_week": "Tuesday",
                "exercises": [
                    "Barbell Deadlift",
                    "Pull-up",
                    "Dumbbell Row",
                    "Barbell Bicep Curl",
                    "Hammer Curl",
                ],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": [
                    "Barbell Back Squat",
                    "Romanian Deadlift",
                    "Walking Lunge",
                    "Calf Raise",
                    "Plank",
                ],
            },
            {
                "day_of_week": "Thursday",
                "exercises": [
                    "Overhead Press",
                    "Arnold Press",
                    "Dumbbell Lateral Raise",
                    "Face Pull",
                    "Side Plank",
                ],
            },
            {
                "day_of_week": "Friday",
                "exercises": [
                    "Bulgarian Split Squat",
                    "Goblet Squat",
                    "Hanging Leg Raise",
                    "Russian Twist",
                    "Hollow Body Hold",
                ],
            },
        ],
    },
    {
        **_make_plan(
            "Shred and Tone 6-Week Plan", "paid", "intermediate", duration_weeks=6, price=19.99
        ),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": ["Burpee", "Push-up", "Mountain Climber", "Plank", "Squat Jump"],
            },
            {
                "day_of_week": "Tuesday",
                "exercises": [
                    "Pull-up",
                    "Barbell Bench Press",
                    "Tricep Dip",
                    "Barbell Bicep Curl",
                    "Overhead Press",
                ],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": [
                    "High Knees",
                    "Jumping Jack",
                    "Flutter Kick",
                    "Bicycle Crunch",
                    "V-Up",
                ],
            },
            {
                "day_of_week": "Thursday",
                "exercises": [
                    "Barbell Back Squat",
                    "Walking Lunge",
                    "Calf Raise",
                    "Romanian Deadlift",
                    "Side Plank",
                ],
            },
            {
                "day_of_week": "Friday",
                "exercises": [
                    "Bear Crawl",
                    "Skater Jump",
                    "Box Jump",
                    "Lateral Bound",
                    "Medicine Ball Slam",
                ],
            },
        ],
    },
    {
        **_make_plan(
            "Advanced Powerlifting Block", "paid", "advanced", duration_weeks=10, price=39.99
        ),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": [
                    "Barbell Bench Press",
                    "Decline Dumbbell Press",
                    "Skull Crusher",
                    "Close-Grip Push-up",
                    "Dumbbell Flyes",
                ],
            },
            {
                "day_of_week": "Tuesday",
                "exercises": [
                    "Barbell Deadlift",
                    "Barbell Back Squat",
                    "Romanian Deadlift",
                    "Bulgarian Split Squat",
                    "Calf Raise",
                ],
            },
            {
                "day_of_week": "Thursday",
                "exercises": [
                    "Overhead Press",
                    "Arnold Press",
                    "Pull-up",
                    "Dumbbell Row",
                    "Face Pull",
                ],
            },
            {
                "day_of_week": "Friday",
                "exercises": [
                    "Barbell Back Squat",
                    "Barbell Deadlift",
                    "Hanging Leg Raise",
                    "Ab Wheel Rollout",
                    "Hollow Body Hold",
                ],
            },
        ],
    },
    {
        **_make_plan("Full Body Transformation", "paid", "beginner", duration_weeks=8, price=14.99),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": [
                    "Push-up",
                    "Bodyweight Squat",
                    "Plank",
                    "Dumbbell Row",
                    "Jumping Jack",
                ],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": [
                    "Goblet Squat",
                    "Walking Lunge",
                    "Incline Push-up",
                    "Side Plank",
                    "High Knees",
                ],
            },
            {
                "day_of_week": "Thursday",
                "exercises": [
                    "Burpee",
                    "Mountain Climber",
                    "Russian Twist",
                    "Bicycle Crunch",
                    "Flutter Kick",
                ],
            },
            {
                "day_of_week": "Friday",
                "exercises": [
                    "Calf Raise",
                    "Tricep Dip",
                    "Hammer Curl",
                    "Face Pull",
                    "Superman Hold",
                ],
            },
        ],
    },
    {
        **_make_plan(
            "Athletic Performance Builder", "paid", "advanced", duration_weeks=12, price=49.99
        ),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": [
                    "Box Jump",
                    "Barbell Deadlift",
                    "Pull-up",
                    "Barbell Back Squat",
                    "Plank",
                ],
            },
            {
                "day_of_week": "Tuesday",
                "exercises": [
                    "Battle Rope Wave",
                    "Medicine Ball Slam",
                    "Burpee",
                    "Squat Jump",
                    "Tuck Jump",
                ],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": [
                    "Overhead Press",
                    "Barbell Bench Press",
                    "Arnold Press",
                    "Skull Crusher",
                    "Face Pull",
                ],
            },
            {
                "day_of_week": "Thursday",
                "exercises": [
                    "Rowing Machine Sprint",
                    "Cycling Sprint",
                    "Rope Jump Double Under",
                    "Lateral Bound",
                    "Broad Jump",
                ],
            },
            {
                "day_of_week": "Friday",
                "exercises": [
                    "Bulgarian Split Squat",
                    "Romanian Deadlift",
                    "Hanging Leg Raise",
                    "Ab Wheel Rollout",
                    "Side Plank",
                ],
            },
        ],
    },
    # ---- PERSONALIZED (weekly, 5 plans) ----
    {
        **_make_plan(
            "Your Beginner Strength Journey", "personalized", "beginner", duration_weeks=4
        ),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": ["Push-up", "Bodyweight Squat", "Plank", "Calf Raise"],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": ["Incline Push-up", "Walking Lunge", "Superman Hold", "Side Plank"],
            },
            {
                "day_of_week": "Friday",
                "exercises": ["Goblet Squat", "Dumbbell Row", "Russian Twist", "Tricep Dip"],
            },
        ],
    },
    {
        **_make_plan("Custom Cardio Kickstart", "personalized", "beginner", duration_weeks=4),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": ["Jumping Jack", "High Knees", "Flutter Kick", "Running in Place"],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": ["Mountain Climber", "Bicycle Crunch", "Scissor Kick", "Step-up"],
            },
            {"day_of_week": "Friday", "exercises": ["Burpee", "Squat Jump", "V-Up", "Skater Jump"]},
        ],
    },
    {
        **_make_plan(
            "Personalized Yoga and Mobility", "personalized", "beginner", duration_weeks=6
        ),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": ["Downward Dog", "Warrior I", "Cobra Pose", "Child's Pose"],
            },
            {
                "day_of_week": "Tuesday",
                "exercises": ["Tree Pose", "Triangle Pose", "Bridge Pose", "Corpse Pose"],
            },
            {
                "day_of_week": "Thursday",
                "exercises": ["Pigeon Pose", "Low Lunge", "Supine Twist", "Seated Forward Fold"],
            },
            {
                "day_of_week": "Saturday",
                "exercises": ["Chair Pose", "Warrior II", "Camel Pose", "Legs Up the Wall"],
            },
        ],
    },
    {
        **_make_plan(
            "Intermediate Push Pull Legs", "personalized", "intermediate", duration_weeks=6
        ),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": [
                    "Barbell Bench Press",
                    "Overhead Press",
                    "Diamond Push-up",
                    "Skull Crusher",
                    "Dumbbell Flyes",
                ],
            },
            {
                "day_of_week": "Tuesday",
                "exercises": [
                    "Pull-up",
                    "Barbell Deadlift",
                    "Dumbbell Row",
                    "Hammer Curl",
                    "Face Pull",
                ],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": [
                    "Barbell Back Squat",
                    "Bulgarian Split Squat",
                    "Walking Lunge",
                    "Calf Raise",
                    "Plank",
                ],
            },
            {
                "day_of_week": "Thursday",
                "exercises": [
                    "Close-Grip Push-up",
                    "Arnold Press",
                    "Tricep Dip",
                    "Barbell Bicep Curl",
                    "Side Plank",
                ],
            },
            {
                "day_of_week": "Friday",
                "exercises": [
                    "Chin-up",
                    "Inverted Row",
                    "Romanian Deadlift",
                    "Goblet Squat",
                    "Hollow Body Hold",
                ],
            },
            {
                "day_of_week": "Saturday",
                "exercises": [
                    "Hanging Leg Raise",
                    "Ab Wheel Rollout",
                    "Russian Twist",
                    "Superman Hold",
                    "Plank",
                ],
            },
        ],
    },
    {
        **_make_plan("Dance Fitness Routine", "personalized", "beginner", duration_weeks=4),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": ["Basic Salsa Step", "Cumbia Step", "Groove Step", "Hip Shake"],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": ["Body Roll", "Running Man Step", "Arm Wave", "Bounce and Pump"],
            },
            {
                "day_of_week": "Friday",
                "exercises": [
                    "Cha-Cha Basic",
                    "Merengue March",
                    "Samba Step",
                    "Cumbia Lateral Step",
                ],
            },
        ],
    },
    # ---- CHALLENGE-TYPE workout plans (5) ----
    {
        **_make_plan("90-Day Muscle Mass Builder", "challenge", "intermediate", duration_weeks=13),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": [
                    "Barbell Bench Press",
                    "Dumbbell Flyes",
                    "Diamond Push-up",
                    "Skull Crusher",
                ],
            },
            {
                "day_of_week": "Tuesday",
                "exercises": ["Pull-up", "Barbell Deadlift", "Dumbbell Row", "Barbell Bicep Curl"],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": [
                    "Barbell Back Squat",
                    "Romanian Deadlift",
                    "Bulgarian Split Squat",
                    "Calf Raise",
                ],
            },
            {
                "day_of_week": "Thursday",
                "exercises": [
                    "Overhead Press",
                    "Arnold Press",
                    "Dumbbell Lateral Raise",
                    "Face Pull",
                ],
            },
            {
                "day_of_week": "Friday",
                "exercises": ["Hanging Leg Raise", "Hollow Body Hold", "Russian Twist", "Plank"],
            },
        ],
    },
    {
        **_make_plan("30-Day Belly Fat Dance Burn", "challenge", "beginner", duration_weeks=4),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": [
                    "Basic Salsa Step",
                    "Reggaeton Squat Pulse",
                    "High Knees",
                    "Jumping Jack",
                ],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": ["Cumbia Step", "Burpee", "Bicycle Crunch", "Flutter Kick"],
            },
            {
                "day_of_week": "Friday",
                "exercises": ["Samba Step", "Squat Jump", "Mountain Climber", "V-Up"],
            },
        ],
    },
    {
        **_make_plan("Marathon Prep 60-Day Plan", "challenge", "advanced", duration_weeks=9),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": ["Running in Place", "High Knees", "Stair Climb", "Rope Jump Basic"],
            },
            {
                "day_of_week": "Tuesday",
                "exercises": ["Burpee", "Squat Jump", "Lateral Bound", "Broad Jump"],
            },
            {
                "day_of_week": "Thursday",
                "exercises": [
                    "Rowing Machine Sprint",
                    "Cycling Sprint",
                    "Rope Jump Double Under",
                    "Tuck Jump",
                ],
            },
            {
                "day_of_week": "Saturday",
                "exercises": ["Box Jump", "Skater Jump", "Bear Crawl", "Medicine Ball Slam"],
            },
        ],
    },
    {
        **_make_plan("21-Day Calisthenics Starter", "challenge", "beginner", duration_weeks=3),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": ["Push-up", "Bodyweight Squat", "Plank", "Jumping Jack"],
            },
            {
                "day_of_week": "Wednesday",
                "exercises": ["Incline Push-up", "Walking Lunge", "Side Plank", "High Knees"],
            },
            {
                "day_of_week": "Friday",
                "exercises": ["Tricep Dip", "Goblet Squat", "Superman Hold", "Mountain Climber"],
            },
        ],
    },
    {
        **_make_plan("14-Day Yoga Reset", "challenge", "beginner", duration_weeks=2),
        "days": [
            {
                "day_of_week": "Monday",
                "exercises": ["Downward Dog", "Child's Pose", "Cobra Pose", "Warrior I"],
            },
            {
                "day_of_week": "Tuesday",
                "exercises": ["Tree Pose", "Bridge Pose", "Supine Twist", "Corpse Pose"],
            },
            {
                "day_of_week": "Thursday",
                "exercises": ["Pigeon Pose", "Low Lunge", "Camel Pose", "Seated Forward Fold"],
            },
            {
                "day_of_week": "Saturday",
                "exercises": [
                    "Warrior II",
                    "Triangle Pose",
                    "Seated Spinal Twist",
                    "Legs Up the Wall",
                ],
            },
        ],
    },
]


# ---------------------------------------------------------------------------
# Challenge definitions
# ---------------------------------------------------------------------------


def _make_challenge(name, duration_days, level, categories, equipment, description):
    return {
        "name": name,
        "description": description,
        "plan_type": "challenge",
        "duration_days": duration_days,
        "price": 0.0,
        "image_url": image_url(name),
        "video_url": VIDEO_BY_CATEGORY["plan"],
        "intensity": True,
        "equipment": equipment,
        "category": categories,
        "level": level,
        "is_active": True,
    }


# Exercise rotation pools per challenge type
CHALLENGE_1_ROTATIONS = [
    # Day pattern (cycled): Chest, Back, Legs, Shoulders, Full Body
    ["Barbell Bench Press", "Push-up", "Diamond Push-up", "Dumbbell Flyes", "Tricep Dip"],
    ["Pull-up", "Dumbbell Row", "Barbell Deadlift", "Inverted Row", "Barbell Bicep Curl"],
    [
        "Barbell Back Squat",
        "Romanian Deadlift",
        "Bulgarian Split Squat",
        "Walking Lunge",
        "Calf Raise",
    ],
    ["Overhead Press", "Arnold Press", "Dumbbell Lateral Raise", "Face Pull", "Pike Push-up"],
    ["Plank", "Hollow Body Hold", "Hanging Leg Raise", "Russian Twist", "Side Plank"],
]

CHALLENGE_2_ROTATIONS = [
    # Dance day
    [
        "Basic Salsa Step",
        "Cumbia Step",
        "Hip Shake",
        "Reggaeton Squat Pulse",
        "Samba Step",
        "Groove Step",
    ],
    # HIIT day
    ["Burpee", "High Knees", "Jumping Jack", "Mountain Climber", "Squat Jump", "Bicycle Crunch"],
]

CHALLENGE_3_ROTATIONS = [
    # Endurance
    ["Running in Place", "High Knees", "Stair Climb", "Rope Jump Basic", "Step-up"],
    # Interval HIIT
    ["Burpee", "Squat Jump", "Lateral Bound", "Tuck Jump", "Skater Jump"],
    # Active Recovery Cardio
    ["Jumping Jack", "Flutter Kick", "Scissor Kick", "Bear Crawl", "Running in Place"],
    # Plyometric Power
    ["Box Jump", "Broad Jump", "Medicine Ball Slam", "Rope Jump Double Under", "Battle Rope Wave"],
]


def build_challenge_days(
    duration_days, rest_every_n, rotation_pool, ex_sets=3, ex_reps=12, ex_rest=60
):
    days = []
    training_day_idx = 0
    for seq in range(1, duration_days + 1):
        is_rest = seq % rest_every_n == 0
        exercises = []
        if not is_rest:
            pool = rotation_pool[training_day_idx % len(rotation_pool)]
            exercises = pool
            training_day_idx += 1
        days.append(
            {
                "sequence_day": seq,
                "name": f"Rest Day {seq}" if is_rest else f"Day {seq}",
                "is_rest": is_rest,
                "exercises": exercises,
                "sets": ex_sets,
                "reps": ex_reps,
                "rest_seconds": ex_rest,
            }
        )
    return days


CHALLENGES_DATA = [
    {
        **_make_challenge(
            "90-Day Muscle Mass Builder",
            90,
            "intermediate",
            ["strength"],
            ["barbell", "dumbbells", "bench", "pull-up bar"],
            "Build serious muscle mass in 90 days with progressive strength training. Rotate between chest, back, legs, shoulders, and full-body days.",
        ),
        "days": build_challenge_days(
            90, 7, CHALLENGE_1_ROTATIONS, ex_sets=4, ex_reps=10, ex_rest=90
        ),
    },
    {
        **_make_challenge(
            "30-Day Belly Fat Dance Burn",
            30,
            "beginner",
            ["dance", "cardio"],
            [],
            "Torch belly fat in 30 days by alternating energetic dance cardio days with HIIT sessions. No equipment needed — just bring the rhythm!",
        ),
        "days": build_challenge_days(
            30, 7, CHALLENGE_2_ROTATIONS, ex_sets=3, ex_reps=15, ex_rest=45
        ),
    },
    {
        **_make_challenge(
            "Marathon Ready 60-Day Prep",
            60,
            "advanced",
            ["cardio"],
            ["jump rope", "rowing machine", "bike"],
            "Prepare your body for a marathon in 60 days. Cycle through endurance runs, interval HIIT, active recovery, and plyometric power sessions.",
        ),
        "days": build_challenge_days(
            60, 7, CHALLENGE_3_ROTATIONS, ex_sets=3, ex_reps=20, ex_rest=60
        ),
    },
]


# ---------------------------------------------------------------------------
# Seed runner
# ---------------------------------------------------------------------------


def default_sets_reps_rest(exercise_name: str) -> tuple[int, int, int]:
    """Return (sets, reps, rest_seconds) sensible defaults by exercise category."""
    return 3, 12, 60


def seed():
    app = create_app()
    with app.app_context():
        db.create_all()
        ensure_muscles_seeded()

        existing = db.session.query(Exercise).count()
        if existing > 0:
            n_links = sync_exercise_muscle_links_from_legacy()
            db.session.commit()
            print(f"[seed] Database already has {existing} exercises. Skipping seed.")
            print(f"[seed] Muscle taxonomy refreshed ({n_links} exercise_muscles links).")
            print(
                "[seed] To re-seed, truncate the exercises/workout_plans/challenges tables first."
            )
            return

        print("[seed] Starting seed...")

        # 1. Build exercise name → model map
        exercise_map: dict[str, Exercise] = {}

        print(f"[seed] Inserting {len(EXERCISES_DATA)} exercises...")
        for data in EXERCISES_DATA:
            ex = Exercise(
                name=data["name"],
                description=data.get("description", f"Perform {data['name']} with proper form."),
                category=data["category"],
                image_url=image_url(data["name"]),
                video_url=VIDEO_BY_CATEGORY[data["category"]],
                muscle_group=data["muscle_group"],
                difficulty=data["difficulty"],
                equipment=data["equipment"],
                instructions=data["instructions"],
                contradictions=data["contradictions"],
                is_active=True,
            )
            db.session.add(ex)
            exercise_map[data["name"]] = ex

        db.session.flush()
        print(f"[seed] {len(exercise_map)} exercises inserted.")

        # 2. Workout plans
        print(f"[seed] Inserting {len(WORKOUT_PLANS_DATA)} workout plans...")
        for plan_data in WORKOUT_PLANS_DATA:
            plan = WorkoutPlan(
                name=plan_data["name"],
                description=plan_data["description"],
                plan_type=plan_data["plan_type"],
                duration_weeks=plan_data.get("duration_weeks"),
                price=plan_data.get("price", 0.0),
                image_url=plan_data["image_url"],
                video_url=plan_data["video_url"],
                level=plan_data["level"],
                is_active=True,
            )
            db.session.add(plan)
            db.session.flush()

            for day_idx, day_data in enumerate(plan_data["days"]):
                day = WorkoutDay(
                    workout_plan_id=plan.id,
                    day_of_week=day_data.get("day_of_week"),
                    sequence_day=day_idx + 1,
                )
                db.session.add(day)
                db.session.flush()

                seen_exercises: set[str] = set()
                for ex_name in day_data["exercises"]:
                    if ex_name in seen_exercises:
                        continue
                    exercise = exercise_map.get(ex_name)
                    if not exercise:
                        print(f"[seed] WARNING: Exercise '{ex_name}' not found, skipping.")
                        continue
                    sets, reps, rest = default_sets_reps_rest(ex_name)
                    wde = WorkoutDayExercise(
                        workout_day_id=day.id,
                        exercise_id=exercise.id,
                        sets=sets,
                        reps=reps,
                        rest_seconds=rest,
                    )
                    db.session.add(wde)
                    seen_exercises.add(ex_name)

        print("[seed] Workout plans inserted.")

        # 3. Challenges
        print(f"[seed] Inserting {len(CHALLENGES_DATA)} challenges...")
        for ch_data in CHALLENGES_DATA:
            challenge = Challenge(
                name=ch_data["name"],
                description=ch_data["description"],
                plan_type=ch_data["plan_type"],
                duration_days=ch_data["duration_days"],
                price=ch_data["price"],
                image_url=ch_data["image_url"],
                video_url=ch_data["video_url"],
                intensity=ch_data["intensity"],
                equipment=ch_data["equipment"],
                category=ch_data["category"],
                level=ch_data["level"],
                is_active=True,
            )
            db.session.add(challenge)
            db.session.flush()

            for day_data in ch_data["days"]:
                ch_day = ChallengeDay(
                    challenge_id=challenge.id,
                    sequence_day=day_data["sequence_day"],
                    name=day_data["name"],
                    is_rest=day_data["is_rest"],
                )
                db.session.add(ch_day)
                db.session.flush()

                if day_data["is_rest"]:
                    continue

                seen_exercises: set[str] = set()
                for ex_name in day_data["exercises"]:
                    if ex_name in seen_exercises:
                        continue
                    exercise = exercise_map.get(ex_name)
                    if not exercise:
                        print(f"[seed] WARNING: Exercise '{ex_name}' not found, skipping.")
                        continue
                    cde = ChallengeDayExercise(
                        challenge_day_id=ch_day.id,
                        exercise_id=exercise.id,
                        sets=day_data["sets"],
                        reps=day_data["reps"],
                        rest_seconds=day_data["rest_seconds"],
                    )
                    db.session.add(cde)
                    seen_exercises.add(ex_name)

        n_links = sync_exercise_muscle_links_from_legacy()
        db.session.commit()
        print("[seed] ✓ All data committed successfully.")
        print(f"[seed]   - {len(EXERCISES_DATA)} exercises")
        print(f"[seed]   - {len(WORKOUT_PLANS_DATA)} workout plans")
        print(f"[seed]   - {len(CHALLENGES_DATA)} challenges")
        print(f"[seed]   - {n_links} exercise_muscles links (from legacy muscle_group)")


if __name__ == "__main__":
    seed()
