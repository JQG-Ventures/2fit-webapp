from pydantic import BaseModel, Field
from typing import Optional, List


class UserProfile(BaseModel):
    name: Optional[str] = Field(None, description="User's name")
    fitness_goal: Optional[str] = Field(None, description="User's fitness goal (e.g., weight_loss, muscle_gain, endurance)")
    fitness_level: Optional[str] = Field(None, description="User's fitness level (beginner, intermediate, advanced)")
    dietary_preferences: Optional[str] = Field(None, description="Dietary preferences or restrictions")
    injuries: Optional[List[str]] = Field(default_factory=list, description="List of injuries or physical limitations")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John",
                "fitness_goal": "weight_loss",
                "fitness_level": "beginner",
                "dietary_preferences": "vegetarian",
                "injuries": ["knee pain"]
            }
        }


class CoachResponse(BaseModel):
    message: str = Field(..., description="Main response message from the coach")
    recommendations: List[str] = Field(default_factory=list, description="List of actionable recommendations")
    follow_up_question: Optional[str] = Field(None, description="Optional follow-up question to gather more information")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Great to hear you want to start training! Let's begin with a beginner-friendly routine.",
                "recommendations": [
                    "Start with 3 days per week",
                    "Focus on full-body exercises",
                    "Include 10 minutes of warm-up"
                ],
                "follow_up_question": "What's your current fitness level?"
            }
        }


class AgentState(BaseModel):
    messages: List[dict] = Field(default_factory=list, description="Conversation messages")
    user_profile: Optional[UserProfile] = Field(None, description="Current user profile")
    rag_context: Optional[str] = Field(None, description="Context retrieved from RAG")
    next_action: Optional[str] = Field(None, description="Next action to take")
    response: Optional[CoachResponse] = Field(None, description="Final response")
    user_session_data: Optional[dict] = Field(None, description="Current workout session data")
    user_progress_data: Optional[dict] = Field(None, description="User progress summary data")
    metadata: Optional[dict] = Field(None, description="Metadata about the interaction")
