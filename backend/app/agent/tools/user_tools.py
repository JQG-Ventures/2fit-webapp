from langchain_core.tools import tool
from app.agent.memory import MemoryManager
from app.agent.models import UserProfile
from typing import Optional
import logging

logger = logging.getLogger(__name__)


@tool
def get_user_profile(user_id: str) -> dict:
    """Get the user's fitness profile including goals, level, dietary preferences, and injuries.
    
    Args:
        user_id: The unique identifier for the user
        
    Returns:
        A dictionary containing the user's profile information or an error message
    """
    try:
        memory = MemoryManager(user_id)
        profile = memory.get_user_profile()
        
        if profile:
            return profile.model_dump(exclude_none=True)
        return {"message": "No profile found"}
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        return {"error": str(e)}


@tool
def update_user_profile(
    user_id: str,
    name: Optional[str] = None,
    fitness_goal: Optional[str] = None,
    fitness_level: Optional[str] = None,
    dietary_preferences: Optional[str] = None,
    injuries: Optional[list] = None
) -> dict:
    """Update the user's fitness profile with new information.
    
    Args:
        user_id: The unique identifier for the user
        name: Optional user's name
        fitness_goal: Optional fitness goal (e.g., weight_loss, muscle_gain, endurance)
        fitness_level: Optional fitness level (beginner, intermediate, advanced)
        dietary_preferences: Optional dietary preferences or restrictions
        injuries: Optional list of injuries or physical limitations
        
    Returns:
        A dictionary with status and updated profile information
    """
    try:
        memory = MemoryManager(user_id)
        current_profile = memory.get_user_profile() or UserProfile()
        
        if name:
            current_profile.name = name
        if fitness_goal:
            current_profile.fitness_goal = fitness_goal
        if fitness_level:
            current_profile.fitness_level = fitness_level
        if dietary_preferences:
            current_profile.dietary_preferences = dietary_preferences
        if injuries:
            current_profile.injuries = injuries if isinstance(injuries, list) else [injuries]
        
        memory.update_user_profile(current_profile)
        
        return {
            "status": "success",
            "profile": current_profile.model_dump(exclude_none=True)
        }
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        return {"error": str(e)}
