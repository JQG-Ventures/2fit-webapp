from langchain_core.tools import tool
from app.models.exercise import Exercise
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)


@tool
def search_exercises(
    user_id: str,
    muscle_group: Optional[str] = None,
    equipment: Optional[str] = None,
    category: Optional[str] = None,
    limit: Optional[int] = 10
) -> dict:
    """Search for exercises in the database by muscle group, equipment, or category.
    
    This tool searches the actual exercise database and returns real exercises with
    detailed information including descriptions, videos, images, and instructions.
    
    Args:
        user_id: The unique identifier for the user
        muscle_group: Optional muscle group to filter (e.g., chest, back, legs, arms, core)
        equipment: Optional equipment filter (e.g., dumbbell, barbell, bodyweight, machine)
        category: Optional category filter (e.g., strength, cardio, flexibility)
        limit: Maximum number of exercises to return (default: 10, max: 20)
        
    Returns:
        A dictionary containing matching exercises with their details
    """
    try:
        all_exercises = Exercise.get_exercises()
        
        if not all_exercises:
            return {
                "status": "no_exercises_found",
                "message": "No exercises found in database."
            }
        
        filtered_exercises = all_exercises
        
        if muscle_group:
            muscle_lower = muscle_group.lower()
            filtered_exercises = [
                ex for ex in filtered_exercises
                if muscle_lower in [mg.lower() for mg in ex.get("muscle_group", [])]
            ]
        
        if equipment:
            equipment_lower = equipment.lower()
            filtered_exercises = [
                ex for ex in filtered_exercises
                if equipment_lower in [eq.lower() for eq in ex.get("equipment", [])]
            ]
        
        if category:
            category_lower = category.lower()
            filtered_exercises = [
                ex for ex in filtered_exercises
                if category_lower in [cat.lower() for cat in ex.get("category", [])]
            ]
        
        limit = min(limit or 10, 20)
        filtered_exercises = filtered_exercises[:limit]
        
        exercise_list = []
        for ex in filtered_exercises:
            exercise_info = {
                "id": str(ex.get("_id", "")),
                "name": ex.get("name", "Unnamed Exercise"),
                "description": ex.get("description", ""),
                "muscle_groups": ex.get("muscle_group", []),
                "equipment": ex.get("equipment", []),
                "category": ex.get("category", []),
                "difficulty": ex.get("difficulty", "intermediate"),
                "image_url": ex.get("image_url"),
                "video_url": ex.get("video_url")
            }
            exercise_list.append(exercise_info)
        
        return {
            "status": "success",
            "exercises_found": len(exercise_list),
            "exercises": exercise_list,
            "filters_applied": {
                "muscle_group": muscle_group,
                "equipment": equipment,
                "category": category
            }
        }
    except Exception as e:
        logger.error(f"Error searching exercises: {e}")
        return {
            "status": "error",
            "message": f"Error searching exercises: {str(e)}"
        }


@tool
def get_exercise_details(user_id: str, exercise_id: str) -> dict:
    """Get detailed information about a specific exercise from the database.
    
    Args:
        user_id: The unique identifier for the user
        exercise_id: The ID of the exercise to retrieve
        
    Returns:
        A dictionary containing detailed exercise information
    """
    try:
        exercise = Exercise.get_exercise_by_id(exercise_id)
        
        if not exercise:
            return {
                "status": "not_found",
                "message": f"Exercise with ID {exercise_id} not found."
            }
        
        return {
            "status": "success",
            "exercise": {
                "id": str(exercise.get("_id", "")),
                "name": exercise.get("name", "Unnamed Exercise"),
                "description": exercise.get("description", ""),
                "muscle_groups": exercise.get("muscle_group", []),
                "equipment": exercise.get("equipment", []),
                "category": exercise.get("category", []),
                "difficulty": exercise.get("difficulty", "intermediate"),
                "image_url": exercise.get("image_url"),
                "video_url": exercise.get("video_url")
            }
        }
    except Exception as e:
        logger.error(f"Error getting exercise details: {e}")
        return {
            "status": "error",
            "message": f"Error retrieving exercise: {str(e)}"
        }
