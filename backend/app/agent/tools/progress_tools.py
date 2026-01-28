from langchain_core.tools import tool
from app.models.user import User
from app.services.user_workout_service import UserWorkoutService
from app.agent.memory import MemoryManager
from typing import Optional
import logging

logger = logging.getLogger(__name__)


@tool
def get_current_workout_session(user_id: str) -> dict:
    """Get the current active workout session state for the user.
    
    This includes information about what workout the user is currently doing,
    progress on the current session, and any exercises in progress.
    
    Args:
        user_id: The unique identifier for the user
        
    Returns:
        A dictionary containing the current workout session information or an error message
    """
    try:
        memory = MemoryManager(user_id)
        session_state = memory.get_session_state()
        
        if not session_state:
            return {
                "status": "no_active_session",
                "message": "No active workout session found"
            }
        
        return {
            "status": "success",
            "session": session_state
        }
    except Exception as e:
        logger.error(f"Error getting current workout session: {e}")
        return {"error": str(e)}


@tool
def get_weekly_summary(user_id: str) -> dict:
    """Get a weekly summary of the user's workout activity.
    
    Provides an overview of workouts completed this week, total calories burned,
    total duration, and progress on active plans.
    
    Args:
        user_id: The unique identifier for the user
        
    Returns:
        A dictionary containing weekly summary information
    """
    try:
        weekly_progress = UserWorkoutService.get_weekly_workout_progress(user_id)
        
        return {
            "status": "success",
            "week_start": weekly_progress.get("week_start_date"),
            "week_end": weekly_progress.get("week_end_date"),
            "progress_percentage": weekly_progress.get("progress", 0.0),
            "days": weekly_progress.get("days", [])
        }
    except Exception as e:
        logger.error(f"Error getting weekly summary: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@tool
def analyze_user_progress(user_id: str, weeks: Optional[int] = 4) -> dict:
    """Analyze the user's workout progress over a specified number of weeks.
    
    Provides insights on trends, consistency, improvements, and areas that need attention.
    
    Args:
        user_id: The unique identifier for the user
        weeks: Number of weeks to analyze (default: 4)
        
    Returns:
        A dictionary containing progress analysis with trends and insights
    """
    try:
        memory = MemoryManager(user_id)
        progress_summary = memory.get_user_progress_summary(weeks=weeks)
        
        user = User.get_user_by_id(user_id)
        if not user:
            return {"error": "User not found"}
        
        workout_history = user.get("workout_history", {})
        completed_workouts = workout_history.get("completed_workouts", [])
        
        if not completed_workouts:
            return {
                "status": "success",
                "weeks_analyzed": weeks,
                "summary": progress_summary,
                "insights": [
                    "No workout history found. Start your fitness journey today!",
                    "Consider setting up a workout plan to track your progress."
                ],
                "trends": "insufficient_data"
            }
        
        from datetime import datetime, timedelta
        cutoff_date = datetime.utcnow() - timedelta(weeks=weeks)
        
        recent_workouts = [
            w for w in completed_workouts
            if datetime.fromisoformat(w.get("date", "2000-01-01T00:00:00")) >= cutoff_date
        ]
        
        if len(recent_workouts) < 2:
            return {
                "status": "success",
                "weeks_analyzed": weeks,
                "summary": progress_summary,
                "insights": [
                    "Limited workout data available. Keep training to see trends!",
                    f"You've completed {len(recent_workouts)} workout(s) in the last {weeks} weeks."
                ],
                "trends": "insufficient_data"
            }
        
        workouts_per_week = progress_summary.get("average_per_week", 0)
        
        insights = []
        if workouts_per_week >= 4:
            insights.append("Excellent consistency! You're training regularly.")
        elif workouts_per_week >= 3:
            insights.append("Good consistency. Consider increasing to 4-5 workouts per week for optimal results.")
        elif workouts_per_week >= 2:
            insights.append("Moderate activity. Try to increase frequency to 3-4 workouts per week.")
        else:
            insights.append("Low activity detected. Aim for at least 3 workouts per week to see progress.")
        
        total_calories = progress_summary.get("total_calories", 0)
        if total_calories > 0:
            avg_calories_per_workout = total_calories / len(recent_workouts)
            insights.append(f"Average calories burned per workout: {avg_calories_per_workout:.0f}")
        
        return {
            "status": "success",
            "weeks_analyzed": weeks,
            "summary": progress_summary,
            "insights": insights,
            "trends": "improving" if workouts_per_week >= 3 else "needs_improvement"
        }
    except Exception as e:
        logger.error(f"Error analyzing user progress: {e}")
        return {"error": str(e)}
