from langchain_core.tools import tool
from app.agent.memory import MemoryManager
from app.models.workouts import WorkoutPlan
from app.models.exercise import Exercise
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def _map_goal_to_search_terms(goal: str) -> list:
    """Map fitness goals to search terms for finding relevant workout plans."""
    goal_mapping = {
        "weight": ["weight_loss", "cardio", "fat_burn"],
        "weight_loss": ["weight_loss", "cardio", "fat_burn"],
        "muscle": ["muscle_gain", "strength", "hypertrophy"],
        "muscle_gain": ["muscle_gain", "strength", "hypertrophy"],
        "strength": ["strength", "power", "muscle_gain"],
        "endurance": ["endurance", "cardio", "stamina"],
        "keep": ["maintenance", "general", "fitness"]
    }
    return goal_mapping.get(goal.lower(), ["general", "fitness"])


def _map_user_level(level: str) -> str:
    """Map user fitness level to database level format."""
    level_mapping = {
        "beginner": "beginner",
        "irregular": "beginner",
        "intermediate": "intermediate",
        "advanced": "advanced"
    }
    return level_mapping.get(level.lower(), "beginner")


@tool
def recommend_workout(user_id: str, goal: Optional[str] = None, level: Optional[str] = None) -> dict:
    """Recommend workout plans from the database based on the user's fitness goal and level.
    
    This tool searches the actual workout plans in the database and returns real plans
    that match the user's goals and fitness level. If no plans are found, it provides
    helpful guidance.
    
    Args:
        user_id: The unique identifier for the user
        goal: Optional fitness goal (e.g., weight, weight_loss, muscle, muscle_gain, strength, endurance, keep). 
              If not provided, uses user's profile goal.
        level: Optional fitness level (beginner, intermediate, advanced). 
               If not provided, uses user's profile level or defaults to beginner.
        
    Returns:
        A dictionary containing recommended workout plans from the database with details
        including name, description, duration, exercises, and schedule
    """
    try:
        memory = MemoryManager(user_id)
        profile = memory.get_user_profile()
        
        goal = goal or (profile.fitness_goal if profile else None)
        level = level or (profile.fitness_level if profile else "beginner")
        
        if not goal:
            return {
                "status": "error",
                "message": "Fitness goal is required. Please provide your fitness goal first."
            }
        
        level = _map_user_level(level or "beginner")
        
        try:
            plans_by_level = WorkoutPlan.get_workout_plans_by_difficulty(level)
        except Exception as e:
            logger.warning(f"Error getting plans by difficulty: {e}")
            plans_by_level = []
        
        if not plans_by_level:
            try:
                all_plans = WorkoutPlan.get_workout_plans()
                plans_by_level = [p for p in all_plans if p.get("level", "beginner").lower() == level.lower()]
            except Exception as e:
                logger.warning(f"Error getting all plans: {e}")
                all_plans = []
                plans_by_level = []
        
        if not plans_by_level:
            return {
                "status": "no_plans_found",
                "goal": goal,
                "level": level,
                "message": f"No workout plans found for {level} level. Consider consulting with a fitness professional for a personalized plan.",
                "suggestion": "You can ask me to create a personalized workout plan based on your preferences."
            }
        
        recommended_plans = []
        search_terms = _map_goal_to_search_terms(goal)
        
        for plan in plans_by_level[:5]:
            plan_name = plan.get("name", "").lower()
            plan_desc = plan.get("description", "").lower()
            
            matches_goal = any(term in plan_name or term in plan_desc for term in search_terms)
            
            if matches_goal or len(recommended_plans) < 3:
                plan_summary = {
                    "id": str(plan.get("_id", "")),
                    "name": plan.get("name", "Unnamed Plan"),
                    "description": plan.get("description", ""),
                    "level": plan.get("level", level),
                    "duration_weeks": plan.get("duration_weeks", 0),
                    "plan_type": plan.get("plan_type", "library"),
                    "workout_days": len(plan.get("workout_schedule", [])),
                    "total_exercises": sum(
                        len(day.get("exercises", [])) 
                        for day in plan.get("workout_schedule", [])
                    )
                }
                recommended_plans.append(plan_summary)
        
        if not recommended_plans:
            recommended_plans = [
                {
                    "id": str(plan.get("_id", "")),
                    "name": plan.get("name", "Unnamed Plan"),
                    "description": plan.get("description", ""),
                    "level": plan.get("level", level),
                    "duration_weeks": plan.get("duration_weeks", 0),
                    "plan_type": plan.get("plan_type", "library"),
                    "workout_days": len(plan.get("workout_schedule", [])),
                    "total_exercises": sum(
                        len(day.get("exercises", [])) 
                        for day in plan.get("workout_schedule", [])
                    )
                }
                for plan in plans_by_level[:3]
            ]
        
        return {
            "status": "success",
            "goal": goal,
            "level": level,
            "plans_found": len(recommended_plans),
            "recommended_plans": recommended_plans,
            "message": f"Found {len(recommended_plans)} workout plan(s) matching your {goal} goal and {level} level."
        }
    except Exception as e:
        logger.error(f"Error recommending workout: {e}")
        return {
            "status": "error",
            "message": f"Error retrieving workout plans: {str(e)}"
        }


@tool
def recommend_nutrition(user_id: str, goal: Optional[str] = None) -> dict:
    """Recommend a nutrition plan based on the user's fitness goal and dietary preferences.
    
    Provides personalized nutrition guidance based on scientific principles and the user's
    specific fitness goals. Uses information from the user's profile when available.
    
    Args:
        user_id: The unique identifier for the user
        goal: Optional fitness goal (e.g., weight, weight_loss, muscle, muscle_gain, strength, endurance, keep). 
              If not provided, uses user's profile goal.
        
    Returns:
        A dictionary containing nutrition recommendations including macros, meal frequency, 
        food suggestions, and hydration guidelines tailored to the user's goal
    """
    try:
        memory = MemoryManager(user_id)
        profile = memory.get_user_profile()
        
        goal = goal or (profile.fitness_goal if profile else None)
        dietary_prefs = profile.dietary_preferences if profile else None
        
        if not goal:
            return {
                "status": "error",
                "message": "Fitness goal is required for nutrition recommendations."
            }
        
        goal_lower = goal.lower()
        
        nutrition_guidelines = {
            "weight": {
                "calorie_deficit": "Create a moderate calorie deficit (500-750 kcal/day)",
                "macros": "40% protein, 30% carbs, 30% fats",
                "meals": "3-4 meals per day with protein in each",
                "foods": [
                    "Lean proteins: chicken, fish, tofu, legumes",
                    "Vegetables: leafy greens, broccoli, bell peppers",
                    "Whole grains: quinoa, brown rice, oats (moderate portions)",
                    "Healthy fats: avocado, nuts, olive oil (small portions)"
                ],
                "avoid": "Processed foods, sugary drinks, excessive alcohol",
                "hydration": "2-3 liters of water daily"
            },
            "weight_loss": {
                "calorie_deficit": "Create a moderate calorie deficit (500-750 kcal/day)",
                "macros": "40% protein, 30% carbs, 30% fats",
                "meals": "3-4 meals per day with protein in each",
                "foods": [
                    "Lean proteins: chicken, fish, tofu, legumes",
                    "Vegetables: leafy greens, broccoli, bell peppers",
                    "Whole grains: quinoa, brown rice, oats (moderate portions)",
                    "Healthy fats: avocado, nuts, olive oil (small portions)"
                ],
                "avoid": "Processed foods, sugary drinks, excessive alcohol",
                "hydration": "2-3 liters of water daily"
            },
            "muscle": {
                "calorie_surplus": "Moderate surplus (300-500 kcal/day)",
                "macros": "30% protein, 40% carbs, 30% fats",
                "meals": "4-6 meals per day, protein every 3-4 hours",
                "foods": [
                    "Proteins: lean meat, fish, eggs, dairy, legumes",
                    "Complex carbs: sweet potatoes, brown rice, whole grain pasta",
                    "Healthy fats: nuts, seeds, olive oil, avocado",
                    "Post-workout: protein + fast carbs within 30-60 min"
                ],
                "avoid": "Excessive processed foods, empty calories",
                "hydration": "3-4 liters of water daily, especially around workouts"
            },
            "muscle_gain": {
                "calorie_surplus": "Moderate surplus (300-500 kcal/day)",
                "macros": "30% protein, 40% carbs, 30% fats",
                "meals": "4-6 meals per day, protein every 3-4 hours",
                "foods": [
                    "Proteins: lean meat, fish, eggs, dairy, legumes",
                    "Complex carbs: sweet potatoes, brown rice, whole grain pasta",
                    "Healthy fats: nuts, seeds, olive oil, avocado",
                    "Post-workout: protein + fast carbs within 30-60 min"
                ],
                "avoid": "Excessive processed foods, empty calories",
                "hydration": "3-4 liters of water daily, especially around workouts"
            },
            "strength": {
                "calorie_surplus": "Moderate surplus (300-500 kcal/day) for recovery",
                "macros": "30% protein, 45% carbs, 25% fats",
                "meals": "4-5 meals per day, focus on pre/post workout nutrition",
                "foods": [
                    "High-quality proteins: lean beef, chicken, fish, eggs",
                    "Complex carbs: sweet potatoes, rice, oats for energy",
                    "Healthy fats: nuts, olive oil, avocado",
                    "Post-workout: protein + carbs within 30-60 min for recovery"
                ],
                "avoid": "Excessive processed foods, alcohol before training",
                "hydration": "3-4 liters of water daily, electrolytes for intense sessions"
            },
            "endurance": {
                "calorie_balance": "Match energy expenditure",
                "macros": "25% protein, 55% carbs, 20% fats",
                "meals": "Regular meals + pre/post workout nutrition",
                "foods": [
                    "Complex carbs: whole grains, fruits, starchy vegetables",
                    "Proteins: lean sources for recovery",
                    "Healthy fats: for sustained energy",
                    "Pre-workout: carbs 1-2 hours before",
                    "During: electrolytes and carbs for long sessions",
                    "Post-workout: carbs + protein for recovery"
                ],
                "avoid": "Heavy meals before training",
                "hydration": "Adequate hydration before, during, and after"
            },
            "keep": {
                "calorie_balance": "Maintain current weight",
                "macros": "30% protein, 40% carbs, 30% fats",
                "meals": "3-4 balanced meals per day",
                "foods": [
                    "Variety of proteins: lean meats, fish, plant-based options",
                    "Whole grains and complex carbs",
                    "Plenty of vegetables and fruits",
                    "Healthy fats in moderation"
                ],
                "avoid": "Excessive processed foods, maintain moderation",
                "hydration": "2-3 liters of water daily"
            }
        }
        
        recommendation = nutrition_guidelines.get(goal_lower)
        
        if not recommendation:
            recommendation = {
                "calorie_balance": "Maintain balanced caloric intake",
                "macros": "30% protein, 40% carbs, 30% fats",
                "meals": "3-4 balanced meals per day",
                "foods": [
                    "Variety of whole foods",
                    "Lean proteins",
                    "Complex carbohydrates",
                    "Healthy fats"
                ],
                "avoid": "Excessive processed foods",
                "hydration": "Stay well hydrated throughout the day"
            }
        
        if dietary_prefs:
            recommendation["dietary_notes"] = f"Consider your {dietary_prefs} preferences when selecting foods. Adjust protein sources accordingly."
        
        return {
            "status": "success",
            "goal": goal,
            "recommendations": recommendation
        }
    except Exception as e:
        logger.error(f"Error recommending nutrition: {e}")
        return {
            "status": "error",
            "message": f"Error providing nutrition recommendations: {str(e)}"
        }
