#!/usr/bin/env python3
"""Script to generate workout plans seed file."""

import json
from datetime import datetime

# Exercise IDs from the database
exercises = {
    'strength': [
        '697989886a16b97ee87b79cc',  # Deadlift
        '697989886a16b97ee87b79cd',  # Bench Press
        '697989886a16b97ee87b79ce',  # Overhead Press
        '697989886a16b97ee87b79cf',  # Barbell Row
        '697989886a16b97ee87b79d0',  # Pull-ups
        '6954c455814376d23952c5b7',  # Push-ups
        '6954c455814376d23952c5b8',  # Squats
        '6954c455814376d23952c5bb',  # Lunges
        '697989886a16b97ee87b79d1',  # Dumbbell Curls
        '697989886a16b97ee87b79d2',  # Tricep Extensions
        '697989886a16b97ee87b79d3',  # Lateral Raises
        '697989886a16b97ee87b79d4',  # Leg Press
        '697989886a16b97ee87b79d7',  # Romanian Deadlift
        '697989886a16b97ee87b79d8',  # Bulgarian Split Squats
        '697989886a16b97ee87b79d9',  # Goblet Squats
        '697989886a16b97ee87b79da',  # Chest Flyes
        '697989886a16b97ee87b79dc',  # Bent-Over Rows
        '697989886a16b97ee87b7a02',  # Glute Bridges
        '697989886a16b97ee87b7a03',  # Single Leg Glute Bridge
        '697989886a16b97ee87b7a04',  # Side Plank
        '697989886a16b97ee87b7a05',  # Bird Dog
        '697989886a16b97ee87b7a06',  # Dead Bug
        '697989886a16b97ee87b7a07',  # Bicycle Crunches
        '697989886a16b97ee87b7a08',  # Hip Thrusts
        '697989886a16b97ee87b7a09',  # Walking Lunges
        '697989886a16b97ee87b7a0a',  # Reverse Lunges
        '697989886a16b97ee87b7a0b',  # Sumo Squats
        '697989886a16b97ee87b7a0c',  # Pistol Squats
        '697989886a16b97ee87b7a0d',  # Wall Sit
        '697989886a16b97ee87b7a11',  # Hamstring Curls
        '697989886a16b97ee87b7a12',  # Leg Extensions
        '697989886a16b97ee87b7a13',  # Seated Leg Press
        '697989886a16b97ee87b7a14',  # Chest Press Machine
        '697989886a16b97ee87b7a15',  # Lat Pulldown
        '697989886a16b97ee87b7a16',  # Cable Flyes
        '697989886a16b97ee87b7a17',  # Cable Tricep Extensions
        '697989886a16b97ee87b7a18',  # Cable Bicep Curls
        '697989886a16b97ee87b7a1a',  # Kettlebell Goblet Squat
        '697989886a16b97ee87b7a1b',  # Kettlebell Turkish Get-Up
        '697989886a16b97ee87b7a1c',  # Resistance Band Rows
        '697989886a16b97ee87b7a1d',  # Resistance Band Chest Press
        '697989886a16b97ee87b7a1e',  # Resistance Band Lateral Raises
        '697989886a16b97ee87b7a1f',  # Resistance Band Squats
    ],
    'yoga': [
        '6954c455814376d23952c5c0',  # Warrior I
        '697989886a16b97ee87b79e1',  # Tree Pose
        '697989886a16b97ee87b79e2',  # Warrior II
        '697989886a16b97ee87b79e3',  # Warrior III
        '697989886a16b97ee87b79e4',  # Triangle Pose
        '697989886a16b97ee87b79e5',  # Cobra Pose
        '697989886a16b97ee87b79e6',  # Pigeon Pose
        '697989886a16b97ee87b79e7',  # Seated Forward Fold
        '697989886a16b97ee87b79e8',  # Cat-Cow Pose
        '697989886a16b97ee87b79e9',  # Camel Pose
        '697989886a16b97ee87b79ea',  # Bridge Pose
        '697989886a16b97ee87b79eb',  # Half Moon Pose
        '697989886a16b97ee87b79ec',  # Crow Pose
        '697989886a16b97ee87b79ed',  # Happy Baby Pose
        '697989886a16b97ee87b79ee',  # Corpse Pose
        '697989886a16b97ee87b79ef',  # Sphinx Pose
        '697989886a16b97ee87b79f0',  # Revolved Triangle Pose
        '697989886a16b97ee87b79f1',  # Dancer Pose
        '6954c455814376d23952c5bf',  # Downward Dog
        '6954c455814376d23952c5c6',  # Sun Salutation
        '6954c455814376d23952c5c1',  # Child's Pose
        '697989886a16b97ee87b7a20',  # Standing Hamstring Stretch
        '697989886a16b97ee87b7a21',  # Quadriceps Stretch
        '697989886a16b97ee87b7a22',  # Shoulder Stretch
        '697989886a16b97ee87b7a23',  # Hip Flexor Stretch
        '697989886a16b97ee87b7a24',  # IT Band Stretch
        '697989886a16b97ee87b7a25',  # Neck Stretch
        '697989886a16b97ee87b7a26',  # Wrist Stretch
        '697989886a16b97ee87b7a27',  # Ankle Circles
        '697989886a16b97ee87b7a28',  # Arm Circles
        '697989886a16b97ee87b7a29',  # Leg Swings
        '697989886a16b97ee87b7a2a',  # Torso Twists
    ],
    'cardio': [
        '6954c455814376d23952c5bc',  # Mountain Climbers
        '6954c455814376d23952c5bd',  # Jumping Jacks
        '6954c455814376d23952c5c2',  # High Knees
        '697989886a16b97ee87b79f9',  # Running in Place
        '697989886a16b97ee87b79fa',  # Butt Kicks
        '697989886a16b97ee87b79fb',  # Skaters
        '697989886a16b97ee87b79fc',  # Mountain Climbers (new)
        '697989886a16b97ee87b79fd',  # Tuck Jumps
        '697989886a16b97ee87b79fe',  # Star Jumps
        '697989886a16b97ee87b79ff',  # Speed Skaters
        '697989886a16b97ee87b7a00',  # Box Jumps
        '6954c455814376d23952c5ba',  # Burpees
        '6954c455814376d23952c5c5',  # Jump Rope
        '697989886a16b97ee87b7a19',  # Kettlebell Swings
    ],
    'dance': [
        '6954c455814376d23952c5c7',  # Dance Cardio - Basic Steps
        '697989886a16b97ee87b79f2',  # Zumba Basic Steps
        '697989886a16b97ee87b79f3',  # Hip Hop Groove
        '697989886a16b97ee87b79f4',  # Salsa Steps
        '697989886a16b97ee87b79f5',  # Ballroom Dance Basics
        '697989886a16b97ee87b79f6',  # Bollywood Dance Moves
        '697989886a16b97ee87b79f7',  # Afrobeat Dance
        '697989886a16b97ee87b79f8',  # Dance Cardio Burst
    ],
    'core': [
        '6954c455814376d23952c5be',  # Crunches
        '6954c455814376d23952c5c4',  # Leg Raises
        '6954c455814376d23952c5c9',  # Russian Twists
        '6954c455814376d23952c5b9',  # Plank
        '6954c455814376d23952c5ca',  # Bridge
    ]
}

def create_exercise(exercise_id, sets=3, reps=12, rest=60):
    """Create exercise object."""
    return {
        "exercise_id": exercise_id,
        "sets": sets,
        "reps": reps,
        "rest_seconds": rest
    }

def create_one_day_workout(name, description, exercise_ids, level="beginner", plan_type="library"):
    """Create a one-day workout plan."""
    exercises_list = []
    for i, ex_id in enumerate(exercise_ids):
        if i < 3:  # First 3 exercises: 4 sets
            exercises_list.append(create_exercise(ex_id, sets=4, reps=12, rest=60))
        elif i < 6:  # Next 3: 3 sets
            exercises_list.append(create_exercise(ex_id, sets=3, reps=15, rest=45))
        else:  # Rest: 3 sets, higher reps
            exercises_list.append(create_exercise(ex_id, sets=3, reps=20, rest=30))
    
    return {
        "name": name,
        "description": description,
        "plan_type": plan_type,
        "level": level,
        "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "workout_schedule": [
            {
                "day_of_week": "",
                "exercises": exercises_list[:min(8, len(exercises_list))]
            }
        ],
        "is_active": True
    }

def create_multi_day_workout(name, description, days_data, duration_weeks, level="beginner", plan_type="library"):
    """Create a multi-day workout plan."""
    schedule = []
    for day_num, exercise_ids in enumerate(days_data, 1):
        exercises_list = []
        for i, ex_id in enumerate(exercise_ids):
            if i < 3:
                exercises_list.append(create_exercise(ex_id, sets=4, reps=12, rest=60))
            elif i < 6:
                exercises_list.append(create_exercise(ex_id, sets=3, reps=15, rest=45))
            else:
                exercises_list.append(create_exercise(ex_id, sets=3, reps=20, rest=30))
        
        schedule.append({
            "sequence_day": day_num,
            "exercises": exercises_list[:min(8, len(exercises_list))]
        })
    
    return {
        "name": name,
        "description": description,
        "plan_type": plan_type,
        "duration_weeks": duration_weeks,
        "level": level,
        "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "workout_schedule": schedule,
        "is_active": True
    }

# Generate workout plans
workout_plans = []

# ONE-DAY WORKOUTS (30 total)
# Gym/Strength Workouts (10)
workout_plans.append(create_one_day_workout(
    "Full Body Strength Blast",
    "Complete full-body strength workout targeting all major muscle groups",
    exercises['strength'][:8],
    "intermediate"
))

workout_plans.append(create_one_day_workout(
    "Upper Body Power",
    "Intense upper body workout focusing on chest, back, and arms",
    [exercises['strength'][1], exercises['strength'][3], exercises['strength'][4], 
     exercises['strength'][0], exercises['strength'][9], exercises['strength'][10], 
     exercises['strength'][11], exercises['strength'][16]],
    "intermediate"
))

workout_plans.append(create_one_day_workout(
    "Leg Day Destroyer",
    "Complete lower body workout for maximum leg development",
    [exercises['strength'][6], exercises['strength'][7], exercises['strength'][12], 
     exercises['strength'][13], exercises['strength'][14], exercises['strength'][17], 
     exercises['strength'][18], exercises['strength'][19]],
    "intermediate"
))

workout_plans.append(create_one_day_workout(
    "Push Day - Chest & Triceps",
    "Focused push workout for chest, shoulders, and triceps",
    [exercises['strength'][1], exercises['strength'][2], exercises['strength'][15], 
     exercises['strength'][9], exercises['strength'][10], exercises['strength'][35], 
     exercises['strength'][36], exercises['strength'][37]],
    "intermediate"
))

workout_plans.append(create_one_day_workout(
    "Pull Day - Back & Biceps",
    "Comprehensive pull workout targeting back and biceps",
    [exercises['strength'][3], exercises['strength'][4], exercises['strength'][16], 
     exercises['strength'][8], exercises['strength'][34], exercises['strength'][39], 
     exercises['strength'][40], exercises['strength'][41]],
    "intermediate"
))

workout_plans.append(create_one_day_workout(
    "Core & Abs Focus",
    "Intense core workout for a strong midsection",
    exercises['core'] + [exercises['strength'][20], exercises['strength'][21], exercises['strength'][22]],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Beginner Full Body",
    "Perfect starter workout for gym newcomers",
    exercises['strength'][:6] + exercises['core'][:2],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Advanced Strength Challenge",
    "High-intensity workout for experienced lifters",
    [exercises['strength'][0], exercises['strength'][1], exercises['strength'][2], 
     exercises['strength'][3], exercises['strength'][4], exercises['strength'][12], 
     exercises['strength'][13], exercises['strength'][27]],
    "advanced"
))

workout_plans.append(create_one_day_workout(
    "Home Gym Workout",
    "Effective strength workout using minimal equipment",
    [exercises['strength'][5], exercises['strength'][6], exercises['strength'][7], 
     exercises['strength'][17], exercises['strength'][18], exercises['strength'][19], 
     exercises['core'][0], exercises['core'][3]],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Cut Weight Workout",
    "High-rep, low-rest workout for fat burning and muscle definition",
    exercises['strength'][:6] + exercises['cardio'][:2],
    "intermediate"
))

# Cardio Workouts (5)
workout_plans.append(create_one_day_workout(
    "HIIT Cardio Blast",
    "High-intensity interval training for maximum calorie burn",
    exercises['cardio'][:8],
    "intermediate"
))

workout_plans.append(create_one_day_workout(
    "Cardio & Dancing Fusion",
    "Fun combination of cardio and dance movements",
    exercises['cardio'][:4] + exercises['dance'][:4],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Beginner Cardio",
    "Low-impact cardio workout perfect for beginners",
    [exercises['cardio'][0], exercises['cardio'][1], exercises['cardio'][2], 
     exercises['cardio'][3], exercises['cardio'][4]],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Advanced Cardio Challenge",
    "Extreme cardio workout for advanced athletes",
    exercises['cardio'][6:],
    "advanced"
))

workout_plans.append(create_one_day_workout(
    "Cardio & Heavy to Failure",
    "Intense cardio followed by strength training to failure",
    exercises['cardio'][:4] + exercises['strength'][:4],
    "advanced"
))

# Yoga Workouts (5)
workout_plans.append(create_one_day_workout(
    "Morning Yoga Flow",
    "Gentle yoga sequence to start your day with energy",
    exercises['yoga'][:8],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Yoga for Flexibility",
    "Deep stretching and flexibility focused yoga session",
    exercises['yoga'][20:28],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Power Yoga",
    "Dynamic yoga flow building strength and balance",
    [exercises['yoga'][0], exercises['yoga'][1], exercises['yoga'][2], 
     exercises['yoga'][3], exercises['yoga'][10], exercises['yoga'][11], 
     exercises['yoga'][12], exercises['yoga'][17]],
    "intermediate"
))

workout_plans.append(create_one_day_workout(
    "Restorative Yoga",
    "Relaxing yoga session for recovery and stress relief",
    [exercises['yoga'][7], exercises['yoga'][8], exercises['yoga'][13], 
     exercises['yoga'][14], exercises['yoga'][15], exercises['yoga'][20], 
     exercises['yoga'][21], exercises['yoga'][22]],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Advanced Yoga Challenge",
    "Advanced poses and flows for experienced yogis",
    [exercises['yoga'][2], exercises['yoga'][3], exercises['yoga'][9], 
     exercises['yoga'][12], exercises['yoga'][17], exercises['yoga'][18]],
    "advanced"
))

# Dance Workouts (5)
workout_plans.append(create_one_day_workout(
    "Dance Cardio Party",
    "High-energy dance workout for fun and fitness",
    exercises['dance'],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Zumba & Latin Dance",
    "Latin-inspired dance fitness session",
    [exercises['dance'][0], exercises['dance'][1], exercises['dance'][3], 
     exercises['dance'][7], exercises['cardio'][0], exercises['cardio'][1]],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Hip Hop Dance Workout",
    "Street dance moves for cardio and coordination",
    [exercises['dance'][2], exercises['dance'][5], exercises['dance'][7], 
     exercises['cardio'][2], exercises['cardio'][3]],
    "intermediate"
))

workout_plans.append(create_one_day_workout(
    "Bollywood Dance Fitness",
    "Energetic Indian dance style full body workout",
    [exercises['dance'][5], exercises['dance'][6], exercises['dance'][7], 
     exercises['cardio'][0], exercises['cardio'][1], exercises['cardio'][2]],
    "intermediate"
))

workout_plans.append(create_one_day_workout(
    "Afrobeat Dance Cardio",
    "African-inspired dance moves for intense cardio",
    [exercises['dance'][6], exercises['dance'][7], exercises['cardio'][3], 
     exercises['cardio'][4], exercises['cardio'][5]],
    "intermediate"
))

# Light Training & Rest Day (5)
workout_plans.append(create_one_day_workout(
    "Light Active Recovery",
    "Gentle movement for active recovery days",
    exercises['yoga'][20:26] + exercises['cardio'][:2],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Rest Day Stretching",
    "Full body stretching routine for rest days",
    exercises['yoga'][20:],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Mobility & Flexibility",
    "Focus on joint mobility and muscle flexibility",
    exercises['yoga'][22:] + [exercises['yoga'][7], exercises['yoga'][8]],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Light Cardio & Stretch",
    "Easy cardio with stretching for active rest",
    exercises['cardio'][:3] + exercises['yoga'][20:25],
    "beginner"
))

workout_plans.append(create_one_day_workout(
    "Yoga & Meditation",
    "Calming yoga flow with meditation elements",
    [exercises['yoga'][14], exercises['yoga'][15], exercises['yoga'][7], 
     exercises['yoga'][8], exercises['yoga'][20], exercises['yoga'][21]],
    "beginner"
))

# MULTI-DAY WORKOUT PLANS (20 total)
# 1 Week Plans (10)
workout_plans.append(create_multi_day_workout(
    "1 Week Gym Transformation",
    "Complete 7-day gym program for full body transformation",
    [
        exercises['strength'][:6],  # Day 1: Full Body
        exercises['strength'][1:7],  # Day 2: Upper Focus
        exercises['strength'][6:12],  # Day 3: Lower Focus
        exercises['cardio'][:6],  # Day 4: Cardio
        exercises['strength'][:6],  # Day 5: Full Body
        exercises['yoga'][:6],  # Day 6: Recovery
        exercises['cardio'][:4] + exercises['core'][:2]  # Day 7: Cardio + Core
    ],
    1,
    "intermediate"
))

workout_plans.append(create_multi_day_workout(
    "1 Week Cardio & Dancing",
    "Fun 7-day program combining cardio and dance",
    [
        exercises['cardio'][:6],  # Day 1
        exercises['dance'] + exercises['cardio'][:2],  # Day 2
        exercises['cardio'][:4] + exercises['dance'][:4],  # Day 3
        exercises['dance'][:6] + exercises['cardio'][:2],  # Day 4
        exercises['cardio'][:6],  # Day 5
        exercises['dance'] + exercises['cardio'][:2],  # Day 6
        exercises['yoga'][:6]  # Day 7: Recovery
    ],
    1,
    "beginner"
))

workout_plans.append(create_multi_day_workout(
    "1 Week Cut Weight Program",
    "Intensive 7-day fat loss program",
    [
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 1
        exercises['cardio'][:6],  # Day 2
        exercises['strength'][:4] + exercises['cardio'][:4],  # Day 3
        exercises['cardio'][:6],  # Day 4
        exercises['strength'][:4] + exercises['cardio'][:4],  # Day 5
        exercises['cardio'][:6],  # Day 6
        exercises['yoga'][:6]  # Day 7: Active Recovery
    ],
    1,
    "intermediate"
))

workout_plans.append(create_multi_day_workout(
    "1 Week Yoga Journey",
    "Complete 7-day yoga program for mind and body",
    [
        exercises['yoga'][:6],  # Day 1: Morning Flow
        exercises['yoga'][6:12],  # Day 2: Strength
        exercises['yoga'][12:18],  # Day 3: Balance
        exercises['yoga'][20:26],  # Day 4: Flexibility
        exercises['yoga'][:6],  # Day 5: Flow
        exercises['yoga'][6:12],  # Day 6: Power
        exercises['yoga'][14:20]  # Day 7: Restorative
    ],
    1,
    "beginner"
))

workout_plans.append(create_multi_day_workout(
    "1 Week Push/Pull/Legs",
    "Classic 3-day split repeated for 7 days",
    [
        exercises['strength'][1:7],  # Day 1: Push
        exercises['strength'][3:9],  # Day 2: Pull
        exercises['strength'][6:12],  # Day 3: Legs
        exercises['cardio'][:6],  # Day 4: Cardio
        exercises['strength'][1:7],  # Day 5: Push
        exercises['strength'][3:9],  # Day 6: Pull
        exercises['yoga'][:6]  # Day 7: Rest
    ],
    1,
    "intermediate"
))

workout_plans.append(create_multi_day_workout(
    "1 Week Beginner Full Body",
    "Perfect starter program for fitness beginners",
    [
        exercises['strength'][:4] + exercises['cardio'][:2],  # Day 1
        exercises['yoga'][:6],  # Day 2: Rest
        exercises['strength'][:4] + exercises['cardio'][:2],  # Day 3
        exercises['yoga'][:6],  # Day 4: Rest
        exercises['strength'][:4] + exercises['cardio'][:2],  # Day 5
        exercises['yoga'][:6],  # Day 6: Rest
        exercises['cardio'][:4] + exercises['yoga'][:2]  # Day 7: Light
    ],
    1,
    "beginner"
))

workout_plans.append(create_multi_day_workout(
    "1 Week Advanced Strength",
    "Intensive strength program for advanced lifters",
    [
        exercises['strength'][:8],  # Day 1: Full Body
        exercises['strength'][1:9],  # Day 2: Upper
        exercises['strength'][6:14],  # Day 3: Lower
        exercises['cardio'][:4],  # Day 4: Active Recovery
        exercises['strength'][:8],  # Day 5: Full Body
        exercises['strength'][1:9],  # Day 6: Upper
        exercises['yoga'][:6]  # Day 7: Recovery
    ],
    1,
    "advanced"
))

workout_plans.append(create_multi_day_workout(
    "1 Week Home Workout",
    "Complete home workout program with minimal equipment",
    [
        [exercises['strength'][5], exercises['strength'][6], exercises['strength'][7], 
         exercises['core'][0], exercises['core'][3], exercises['cardio'][0]],  # Day 1
        exercises['yoga'][:6],  # Day 2
        [exercises['strength'][5], exercises['strength'][6], exercises['strength'][7], 
         exercises['core'][0], exercises['core'][3], exercises['cardio'][1]],  # Day 3
        exercises['yoga'][:6],  # Day 4
        [exercises['strength'][5], exercises['strength'][6], exercises['strength'][7], 
         exercises['core'][0], exercises['core'][3], exercises['cardio'][2]],  # Day 5
        exercises['yoga'][:6],  # Day 6
        exercises['cardio'][:4] + exercises['yoga'][:2]  # Day 7
    ],
    1,
    "beginner"
))

workout_plans.append(create_multi_day_workout(
    "1 Week Cardio Intensive",
    "High-intensity cardio program for endurance",
    [
        exercises['cardio'][:6],  # Day 1
        exercises['cardio'][2:8],  # Day 2
        exercises['cardio'][:6],  # Day 3
        exercises['cardio'][4:10],  # Day 4
        exercises['cardio'][:6],  # Day 5
        exercises['cardio'][6:],  # Day 6
        exercises['yoga'][:6]  # Day 7: Recovery
    ],
    1,
    "intermediate"
))

workout_plans.append(create_multi_day_workout(
    "1 Week Balanced Fitness",
    "Well-rounded program with strength, cardio, and flexibility",
    [
        exercises['strength'][:6],  # Day 1: Strength
        exercises['cardio'][:6],  # Day 2: Cardio
        exercises['yoga'][:6],  # Day 3: Flexibility
        exercises['strength'][:6],  # Day 4: Strength
        exercises['cardio'][:6],  # Day 5: Cardio
        exercises['yoga'][:6],  # Day 6: Flexibility
        exercises['yoga'][:6]  # Day 7: Active Recovery
    ],
    1,
    "beginner"
))

# 2 Week Plans (5)
workout_plans.append(create_multi_day_workout(
    "2 Week Gym Mastery",
    "Comprehensive 14-day gym program for serious results",
    [
        exercises['strength'][:6],  # Day 1
        exercises['strength'][1:7],  # Day 2
        exercises['strength'][6:12],  # Day 3
        exercises['cardio'][:6],  # Day 4
        exercises['strength'][:6],  # Day 5
        exercises['strength'][1:7],  # Day 6
        exercises['yoga'][:6],  # Day 7
        exercises['strength'][6:12],  # Day 8
        exercises['strength'][:6],  # Day 9
        exercises['cardio'][:6],  # Day 10
        exercises['strength'][1:7],  # Day 11
        exercises['strength'][6:12],  # Day 12
        exercises['cardio'][:6],  # Day 13
        exercises['yoga'][:6]  # Day 14
    ],
    2,
    "intermediate"
))

workout_plans.append(create_multi_day_workout(
    "2 Week Weight Loss Challenge",
    "Intensive 14-day program for maximum fat loss",
    [
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 1
        exercises['cardio'][:6],  # Day 2
        exercises['strength'][:4] + exercises['cardio'][:4],  # Day 3
        exercises['cardio'][:6],  # Day 4
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 5
        exercises['cardio'][:6],  # Day 6
        exercises['yoga'][:6],  # Day 7
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 8
        exercises['cardio'][:6],  # Day 9
        exercises['strength'][:4] + exercises['cardio'][:4],  # Day 10
        exercises['cardio'][:6],  # Day 11
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 12
        exercises['cardio'][:6],  # Day 13
        exercises['yoga'][:6]  # Day 14
    ],
    2,
    "intermediate"
))

workout_plans.append(create_multi_day_workout(
    "2 Week Yoga & Strength Fusion",
    "14-day program combining yoga and strength training",
    [
        exercises['yoga'][:6],  # Day 1
        exercises['strength'][:6],  # Day 2
        exercises['yoga'][6:12],  # Day 3
        exercises['strength'][:6],  # Day 4
        exercises['yoga'][12:18],  # Day 5
        exercises['strength'][:6],  # Day 6
        exercises['yoga'][:6],  # Day 7
        exercises['yoga'][6:12],  # Day 8
        exercises['strength'][:6],  # Day 9
        exercises['yoga'][12:18],  # Day 10
        exercises['strength'][:6],  # Day 11
        exercises['yoga'][:6],  # Day 12
        exercises['strength'][:6],  # Day 13
        exercises['yoga'][:6]  # Day 14
    ],
    2,
    "intermediate"
))

workout_plans.append(create_multi_day_workout(
    "2 Week Cardio & Dance Extravaganza",
    "Fun 14-day dance and cardio program",
    [
        exercises['cardio'][:6],  # Day 1
        exercises['dance'] + exercises['cardio'][:2],  # Day 2
        exercises['cardio'][:4] + exercises['dance'][:4],  # Day 3
        exercises['dance'][:6] + exercises['cardio'][:2],  # Day 4
        exercises['cardio'][:6],  # Day 5
        exercises['dance'] + exercises['cardio'][:2],  # Day 6
        exercises['yoga'][:6],  # Day 7
        exercises['cardio'][:6],  # Day 8
        exercises['dance'] + exercises['cardio'][:2],  # Day 9
        exercises['cardio'][:4] + exercises['dance'][:4],  # Day 10
        exercises['dance'][:6] + exercises['cardio'][:2],  # Day 11
        exercises['cardio'][:6],  # Day 12
        exercises['dance'] + exercises['cardio'][:2],  # Day 13
        exercises['yoga'][:6]  # Day 14
    ],
    2,
    "beginner"
))

workout_plans.append(create_multi_day_workout(
    "2 Week Complete Transformation",
    "All-inclusive 14-day program for total body transformation",
    [
        exercises['strength'][:6],  # Day 1
        exercises['cardio'][:6],  # Day 2
        exercises['yoga'][:6],  # Day 3
        exercises['strength'][:6],  # Day 4
        exercises['cardio'][:6],  # Day 5
        exercises['dance'] + exercises['cardio'][:2],  # Day 6
        exercises['yoga'][:6],  # Day 7
        exercises['strength'][:6],  # Day 8
        exercises['cardio'][:6],  # Day 9
        exercises['yoga'][:6],  # Day 10
        exercises['strength'][:6],  # Day 11
        exercises['cardio'][:6],  # Day 12
        exercises['dance'] + exercises['cardio'][:2],  # Day 13
        exercises['yoga'][:6]  # Day 14
    ],
    2,
    "intermediate"
))

# 3-4 Week Plans (5)
workout_plans.append(create_multi_day_workout(
    "3 Week Strength Builder",
    "Progressive 21-day strength building program",
    [
        exercises['strength'][:6],  # Day 1
        exercises['strength'][1:7],  # Day 2
        exercises['strength'][6:12],  # Day 3
        exercises['cardio'][:6],  # Day 4
        exercises['strength'][:6],  # Day 5
        exercises['strength'][1:7],  # Day 6
        exercises['yoga'][:6],  # Day 7
        exercises['strength'][6:12],  # Day 8
        exercises['strength'][:6],  # Day 9
        exercises['cardio'][:6],  # Day 10
        exercises['strength'][1:7],  # Day 11
        exercises['strength'][6:12],  # Day 12
        exercises['cardio'][:6],  # Day 13
        exercises['yoga'][:6],  # Day 14
        exercises['strength'][:6],  # Day 15
        exercises['strength'][1:7],  # Day 16
        exercises['strength'][6:12],  # Day 17
        exercises['cardio'][:6],  # Day 18
        exercises['strength'][:6],  # Day 19
        exercises['strength'][1:7],  # Day 20
        exercises['yoga'][:6]  # Day 21
    ],
    3,
    "intermediate"
))

workout_plans.append(create_multi_day_workout(
    "4 Week Complete Fitness",
    "Comprehensive 28-day program for total fitness",
    [
        exercises['strength'][:6],  # Day 1
        exercises['cardio'][:6],  # Day 2
        exercises['yoga'][:6],  # Day 3
        exercises['strength'][:6],  # Day 4
        exercises['cardio'][:6],  # Day 5
        exercises['dance'] + exercises['cardio'][:2],  # Day 6
        exercises['yoga'][:6],  # Day 7
        exercises['strength'][:6],  # Day 8
        exercises['cardio'][:6],  # Day 9
        exercises['yoga'][:6],  # Day 10
        exercises['strength'][:6],  # Day 11
        exercises['cardio'][:6],  # Day 12
        exercises['dance'] + exercises['cardio'][:2],  # Day 13
        exercises['yoga'][:6],  # Day 14
        exercises['strength'][:6],  # Day 15
        exercises['cardio'][:6],  # Day 16
        exercises['yoga'][:6],  # Day 17
        exercises['strength'][:6],  # Day 18
        exercises['cardio'][:6],  # Day 19
        exercises['dance'] + exercises['cardio'][:2],  # Day 20
        exercises['yoga'][:6],  # Day 21
        exercises['strength'][:6],  # Day 22
        exercises['cardio'][:6],  # Day 23
        exercises['yoga'][:6],  # Day 24
        exercises['strength'][:6],  # Day 25
        exercises['cardio'][:6],  # Day 26
        exercises['dance'] + exercises['cardio'][:2],  # Day 27
        exercises['yoga'][:6]  # Day 28
    ],
    4,
    "intermediate"
))

workout_plans.append(create_multi_day_workout(
    "4 Week Weight Loss Intensive",
    "Extreme 28-day fat loss program",
    [
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 1
        exercises['cardio'][:6],  # Day 2
        exercises['strength'][:4] + exercises['cardio'][:4],  # Day 3
        exercises['cardio'][:6],  # Day 4
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 5
        exercises['cardio'][:6],  # Day 6
        exercises['yoga'][:6],  # Day 7
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 8
        exercises['cardio'][:6],  # Day 9
        exercises['strength'][:4] + exercises['cardio'][:4],  # Day 10
        exercises['cardio'][:6],  # Day 11
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 12
        exercises['cardio'][:6],  # Day 13
        exercises['yoga'][:6],  # Day 14
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 15
        exercises['cardio'][:6],  # Day 16
        exercises['strength'][:4] + exercises['cardio'][:4],  # Day 17
        exercises['cardio'][:6],  # Day 18
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 19
        exercises['cardio'][:6],  # Day 20
        exercises['yoga'][:6],  # Day 21
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 22
        exercises['cardio'][:6],  # Day 23
        exercises['strength'][:4] + exercises['cardio'][:4],  # Day 24
        exercises['cardio'][:6],  # Day 25
        exercises['cardio'][:4] + exercises['strength'][:4],  # Day 26
        exercises['cardio'][:6],  # Day 27
        exercises['yoga'][:6]  # Day 28
    ],
    4,
    "advanced"
))

workout_plans.append(create_multi_day_workout(
    "3 Week Yoga Immersion",
    "Deep 21-day yoga practice for transformation",
    [
        exercises['yoga'][:6],  # Day 1
        exercises['yoga'][6:12],  # Day 2
        exercises['yoga'][12:18],  # Day 3
        exercises['yoga'][20:26],  # Day 4
        exercises['yoga'][:6],  # Day 5
        exercises['yoga'][6:12],  # Day 6
        exercises['yoga'][14:20],  # Day 7
        exercises['yoga'][12:18],  # Day 8
        exercises['yoga'][:6],  # Day 9
        exercises['yoga'][6:12],  # Day 10
        exercises['yoga'][20:26],  # Day 11
        exercises['yoga'][:6],  # Day 12
        exercises['yoga'][6:12],  # Day 13
        exercises['yoga'][14:20],  # Day 14
        exercises['yoga'][12:18],  # Day 15
        exercises['yoga'][:6],  # Day 16
        exercises['yoga'][6:12],  # Day 17
        exercises['yoga'][20:26],  # Day 18
        exercises['yoga'][:6],  # Day 19
        exercises['yoga'][6:12],  # Day 20
        exercises['yoga'][14:20]  # Day 21
    ],
    3,
    "intermediate"
))

workout_plans.append(create_multi_day_workout(
    "4 Week Beginner to Intermediate",
    "Progressive 28-day program taking you from beginner to intermediate",
    [
        exercises['strength'][:4] + exercises['cardio'][:2],  # Day 1
        exercises['yoga'][:6],  # Day 2
        exercises['strength'][:4] + exercises['cardio'][:2],  # Day 3
        exercises['yoga'][:6],  # Day 4
        exercises['strength'][:4] + exercises['cardio'][:2],  # Day 5
        exercises['yoga'][:6],  # Day 6
        exercises['cardio'][:4] + exercises['yoga'][:2],  # Day 7
        exercises['strength'][:5] + exercises['cardio'][:3],  # Day 8
        exercises['yoga'][:6],  # Day 9
        exercises['strength'][:5] + exercises['cardio'][:3],  # Day 10
        exercises['yoga'][:6],  # Day 11
        exercises['strength'][:5] + exercises['cardio'][:3],  # Day 12
        exercises['yoga'][:6],  # Day 13
        exercises['cardio'][:5] + exercises['yoga'][:1],  # Day 14
        exercises['strength'][:6] + exercises['cardio'][:2],  # Day 15
        exercises['yoga'][:6],  # Day 16
        exercises['strength'][:6] + exercises['cardio'][:2],  # Day 17
        exercises['yoga'][:6],  # Day 18
        exercises['strength'][:6] + exercises['cardio'][:2],  # Day 19
        exercises['yoga'][:6],  # Day 20
        exercises['cardio'][:6],  # Day 21
        exercises['strength'][:6] + exercises['cardio'][:2],  # Day 22
        exercises['yoga'][:6],  # Day 23
        exercises['strength'][:6] + exercises['cardio'][:2],  # Day 24
        exercises['yoga'][:6],  # Day 25
        exercises['strength'][:6] + exercises['cardio'][:2],  # Day 26
        exercises['yoga'][:6],  # Day 27
        exercises['cardio'][:6]  # Day 28
    ],
    4,
    "beginner"
))

# Write to file
with open('workout_plans_seed.json', 'w', encoding='utf-8') as f:
    json.dump(workout_plans, f, indent=2, ensure_ascii=False)

print(f"Generated {len(workout_plans)} workout plans:")
print(f"- One-day workouts: 30")
print(f"- Multi-day workouts: 20")
print("File saved as workout_plans_seed.json")
