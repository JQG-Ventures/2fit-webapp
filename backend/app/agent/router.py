from app.agent.services.llm import LLMService
from langchain_core.messages import HumanMessage, SystemMessage
from typing import Literal
import logging

logger = logging.getLogger(__name__)


class IntentRouter:
    """Routes user messages to appropriate processing paths based on intent classification."""
    
    INTENT_TYPES = Literal[
        "simple_query",
        "progress_analysis", 
        "workout_planning",
        "nutrition",
        "session_help"
    ]
    
    def __init__(self):
        self.llm_service = LLMService()
        self.classification_prompt = """You are an intent classifier for a fitness coaching AI agent.

Classify the user's message into one of these categories:
1. simple_query - General questions about fitness, exercises, or nutrition (e.g., "What is a squat?", "How to do push-ups?")
2. progress_analysis - Questions about their progress, stats, or performance (e.g., "How am I doing?", "Show my progress", "What's my weekly summary?")
3. workout_planning - Requests to create, modify, or plan workouts (e.g., "Create a workout plan", "Adjust my routine", "Plan my week")
4. nutrition - Questions or requests about nutrition, diet, or meal planning (e.g., "What should I eat?", "Create a meal plan", "Calculate my macros")
5. session_help - Questions about current workout session or immediate help during exercise (e.g., "What exercise is next?", "I'm doing a workout now", "Help me with this exercise")

Respond with ONLY the category name, nothing else."""
    
    def classify_intent(self, user_message: str) -> INTENT_TYPES:
        """Classify the user's message intent using LLM."""
        try:
            llm = self.llm_service.get_llm()
            
            messages = [
                SystemMessage(content=self.classification_prompt),
                HumanMessage(content=user_message)
            ]
            
            response = llm.invoke(messages)
            intent = response.content.strip().lower()
            
            valid_intents = ["simple_query", "progress_analysis", "workout_planning", "nutrition", "session_help"]
            
            if intent in valid_intents:
                return intent
            
            logger.warning(f"Invalid intent classified: {intent}, defaulting to simple_query")
            return "simple_query"
            
        except Exception as e:
            logger.error(f"Error classifying intent: {e}")
            return "simple_query"
    
    def should_load_context(self, intent: str) -> bool:
        """Determine if user context should be loaded based on intent."""
        context_needed_intents = ["progress_analysis", "workout_planning", "session_help"]
        return intent in context_needed_intents
    
    def should_use_rag(self, intent: str) -> bool:
        """Determine if RAG should be used based on intent."""
        rag_intents = ["simple_query", "nutrition"]
        return intent in rag_intents
