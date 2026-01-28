from app.agent.models import UserProfile
from app.extensions import mongo
from app.models.user import User
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class MemoryManager:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.conversation_collection = "agent_conversations"
        self.profile_collection = "agent_profiles"
    
    def get_conversation_memory(self, limit: int = 30) -> List[Dict]:
        try:
            conversation = mongo.db[self.conversation_collection].find_one(
                {"user_id": self.user_id}
            )
            
            if not conversation:
                return []
            
            messages = conversation.get("messages", [])
            return messages[-limit:] if len(messages) > limit else messages
        except Exception as e:
            logger.error(f"Error retrieving conversation memory: {e}")
            return []
    
    def add_message(self, role: str, content: str, metadata: Optional[Dict] = None) -> None:
        try:
            message = {
                "timestamp": datetime.utcnow(),
                "role": role,
                "content": content
            }
            
            if metadata:
                message["metadata"] = metadata
            
            mongo.db[self.conversation_collection].update_one(
                {"user_id": self.user_id},
                {
                    "$setOnInsert": {
                        "user_id": self.user_id,
                        "created_at": datetime.utcnow()
                    },
                    "$set": {"updated_at": datetime.utcnow()},
                    "$push": {"messages": message}
                },
                upsert=True
            )
        except Exception as e:
            logger.error(f"Error adding message to memory: {e}")
    
    def get_session_state(self) -> Optional[Dict]:
        """Get the current workout session state for the user."""
        try:
            user = User.get_user_by_id(self.user_id)
            if not user:
                return None
            
            workout_history = user.get("workout_history", {})
            active_plans = workout_history.get("active_plans", [])
            
            if not active_plans:
                return None
            
            active_plan = next(
                (plan for plan in active_plans if not plan.get("is_completed")),
                None
            )
            
            if not active_plan:
                return None
            
            in_progress_workout = active_plan.get("in_progress_workout")
            
            return {
                "workout_plan_id": active_plan.get("workout_plan_id"),
                "workout_name": active_plan.get("workout_name"),
                "plan_type": active_plan.get("plan_type"),
                "progress": active_plan.get("progress", 0.0),
                "in_progress_workout": in_progress_workout,
                "last_completed_workout": active_plan.get("last_completed_workout")
            }
        except Exception as e:
            logger.error(f"Error retrieving session state: {e}")
            return None
    
    def get_user_progress_summary(self, weeks: int = 4) -> Dict:
        """Get a basic progress summary for the user."""
        try:
            user = User.get_user_by_id(self.user_id)
            if not user:
                return {}
            
            workout_history = user.get("workout_history", {})
            completed_workouts = workout_history.get("completed_workouts", [])
            
            if not completed_workouts:
                return {
                    "total_workouts": 0,
                    "total_calories": 0,
                    "total_duration_minutes": 0,
                    "average_per_week": 0
                }
            
            cutoff_date = datetime.utcnow() - timedelta(weeks=weeks)
            
            recent_workouts = [
                w for w in completed_workouts
                if datetime.fromisoformat(w.get("date", "2000-01-01T00:00:00")) >= cutoff_date
            ]
            
            total_calories = sum(w.get("calories_burned", 0) for w in recent_workouts)
            total_duration = sum(w.get("duration_seconds", 0) for w in recent_workouts)
            
            return {
                "total_workouts": len(recent_workouts),
                "total_calories": round(total_calories, 2),
                "total_duration_minutes": round(total_duration / 60, 2),
                "average_per_week": round(len(recent_workouts) / weeks, 2) if weeks > 0 else 0
            }
        except Exception as e:
            logger.error(f"Error retrieving progress summary: {e}")
            return {}
    
    def get_user_profile(self) -> Optional[UserProfile]:
        try:
            profile_doc = mongo.db[self.profile_collection].find_one(
                {"user_id": self.user_id}
            )
            
            if not profile_doc:
                return None
            
            profile_data = profile_doc.get("profile", {})
            return UserProfile(**profile_data) if profile_data else None
        except Exception as e:
            logger.error(f"Error retrieving user profile: {e}")
            return None
    
    def update_user_profile(self, profile: UserProfile) -> None:
        try:
            profile_dict = profile.model_dump(exclude_none=True)
            
            mongo.db[self.profile_collection].update_one(
                {"user_id": self.user_id},
                {
                    "$setOnInsert": {
                        "user_id": self.user_id,
                        "created_at": datetime.utcnow()
                    },
                    "$set": {
                        "profile": profile_dict,
                        "updated_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
    
    def clear_conversation(self) -> None:
        try:
            mongo.db[self.conversation_collection].update_one(
                {"user_id": self.user_id},
                {"$set": {"messages": []}}
            )
        except Exception as e:
            logger.error(f"Error clearing conversation: {e}")
