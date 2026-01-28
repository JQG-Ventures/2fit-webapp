from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from app.agent.models import CoachResponse
from app.agent.services.llm import LLMService
from app.agent.memory import MemoryManager
from app.agent.rag.vectorstore import VectorStoreManager
from app.agent.router import IntentRouter
from app.agent.tools.user_tools import get_user_profile, update_user_profile
from app.agent.tools.fitness_tools import recommend_workout, recommend_nutrition
from app.agent.tools.progress_tools import get_current_workout_session, get_weekly_summary, analyze_user_progress
from app.agent.tools.exercise_tools import search_exercises, get_exercise_details
from pathlib import Path
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class GraphState(TypedDict):
    messages: Annotated[list, "list"]
    user_id: str
    user_profile: dict
    user_session_data: dict
    user_progress_data: dict
    rag_context: str
    next_action: str
    intent: str
    response: dict
    metadata: dict


class FitnessCoachAgent:
    def __init__(self, user_id: str, vectorstore: VectorStoreManager = None):
        self.user_id = user_id
        self.memory = MemoryManager(user_id)
        self.llm_service = LLMService()
        self.vectorstore = vectorstore
        self.router = IntentRouter()
        
        prompts_dir = Path(__file__).parent / "prompts"
        with open(prompts_dir / "coach_system.txt", "r") as f:
            self.system_prompt = f.read()
        
        self.tools = [
            get_user_profile,
            update_user_profile,
            recommend_workout,
            recommend_nutrition,
            get_current_workout_session,
            get_weekly_summary,
            analyze_user_progress,
            search_exercises,
            get_exercise_details
        ]
        
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(GraphState)
        
        workflow.add_node("router", self._route_intent)
        workflow.add_node("load_user_context", self._load_user_context)
        workflow.add_node("query_rag", self._query_rag)
        workflow.add_node("respond", self._respond)
        
        workflow.set_entry_point("router")
        
        workflow.add_conditional_edges(
            "router",
            self._should_load_context,
            {
                "load_context": "load_user_context",
                "skip_context": "query_rag"
            }
        )
        
        workflow.add_conditional_edges(
            "load_user_context",
            self._should_query_rag_after_context,
            {
                "rag": "query_rag",
                "respond": "respond"
            }
        )
        
        workflow.add_conditional_edges(
            "query_rag",
            self._should_respond_after_rag,
            {
                "respond": "respond"
            }
        )
        
        workflow.add_edge("respond", END)
        
        return workflow.compile()
    
    def _should_respond_after_rag(self, state: GraphState) -> Literal["respond"]:
        """Always go to respond after RAG."""
        return "respond"
    
    def _route_intent(self, state: GraphState) -> GraphState:
        """Classify user intent and set routing decision."""
        messages = state["messages"]
        last_message = messages[-1] if messages else None
        
        if not last_message or last_message.get("role") != "user":
            state["intent"] = "simple_query"
            state["next_action"] = "respond"
            return state
        
        user_input = last_message.get("content", "")
        intent = self.router.classify_intent(user_input)
        
        state["intent"] = intent
        state["metadata"] = state.get("metadata", {})
        state["metadata"]["intent"] = intent
        state["metadata"]["routed_at"] = datetime.utcnow().isoformat()
        
        return state
    
    def _should_load_context(self, state: GraphState) -> Literal["load_context", "skip_context"]:
        """Determine if user context should be loaded."""
        intent = state.get("intent", "simple_query")
        should_load = self.router.should_load_context(intent)
        return "load_context" if should_load else "skip_context"
    
    def _load_user_context(self, state: GraphState) -> GraphState:
        """Load user session and progress data."""
        try:
            session_state = self.memory.get_session_state()
            progress_summary = self.memory.get_user_progress_summary(weeks=4)
            
            state["user_session_data"] = session_state or {}
            state["user_progress_data"] = progress_summary
            
            logger.info(f"Loaded context for user {self.user_id}: session={bool(session_state)}, progress={bool(progress_summary)}")
        except Exception as e:
            logger.error(f"Error loading user context: {e}")
            state["user_session_data"] = {}
            state["user_progress_data"] = {}
        
        return state
    
    def _should_query_rag_after_context(self, state: GraphState) -> Literal["rag", "respond"]:
        """Determine if RAG should be queried after loading context."""
        intent = state.get("intent", "simple_query")
        should_use_rag = self.router.should_use_rag(intent)
        return "rag" if should_use_rag else "respond"
    
    def _should_query_rag(self, state: GraphState) -> Literal["rag", "continue"]:
        intent = state.get("intent", "simple_query")
        should_use_rag = self.router.should_use_rag(intent)
        return "rag" if should_use_rag else "continue"
    
    def _query_rag(self, state: GraphState) -> GraphState:
        if not self.vectorstore:
            state["rag_context"] = ""
            return state
        
        messages = state["messages"]
        last_message = messages[-1] if messages else None
        query = last_message.get("content", "") if last_message else ""
        
        try:
            context = self.vectorstore.get_context(query, k=3)
            state["rag_context"] = context
        except Exception as e:
            logger.error(f"Error querying RAG: {e}")
            state["rag_context"] = ""
        
        return state
    
    def _respond(self, state: GraphState) -> GraphState:
        try:
            start_time = datetime.utcnow()
            llm = self.llm_service.get_llm()
            
            try:
                llm_with_tools = llm.bind_tools(self.tools)
            except Exception as e:
                logger.warning(f"Failed to bind tools: {e}. Using LLM without tools.")
                llm_with_tools = llm
            
            messages = state["messages"]
            rag_context = state.get("rag_context", "")
            session_data = state.get("user_session_data", {})
            progress_data = state.get("user_progress_data", {})
            
            profile = self.memory.get_user_profile()
            user_profile = profile.model_dump(exclude_none=True) if profile else {}
            
            system_message = self.system_prompt
            if user_profile:
                profile_text = f"\n\nUser Profile:\n- Name: {user_profile.get('name', 'Not provided')}\n"
                profile_text += f"- Goal: {user_profile.get('fitness_goal', 'Not provided')}\n"
                profile_text += f"- Level: {user_profile.get('fitness_level', 'Not provided')}\n"
                profile_text += f"- Dietary Preferences: {user_profile.get('dietary_preferences', 'Not provided')}\n"
                if user_profile.get('injuries'):
                    profile_text += f"- Injuries: {', '.join(user_profile['injuries'])}\n"
                system_message += profile_text
            
            if session_data:
                session_text = "\n\nCurrent Workout Session:\n"
                if session_data.get("workout_name"):
                    session_text += f"- Active Workout: {session_data.get('workout_name')}\n"
                if session_data.get("progress") is not None:
                    session_text += f"- Progress: {session_data.get('progress', 0):.1f}%\n"
                if session_data.get("in_progress_workout"):
                    in_progress = session_data["in_progress_workout"]
                    session_text += f"- Currently doing: {in_progress.get('day_of_week', 'workout')}\n"
                system_message += session_text
            
            if progress_data:
                progress_text = "\n\nRecent Progress Summary (Last 4 weeks):\n"
                progress_text += f"- Total Workouts: {progress_data.get('total_workouts', 0)}\n"
                progress_text += f"- Average per Week: {progress_data.get('average_per_week', 0):.1f}\n"
                progress_text += f"- Total Calories Burned: {progress_data.get('total_calories', 0):.0f}\n"
                progress_text += f"- Total Duration: {progress_data.get('total_duration_minutes', 0):.0f} minutes\n"
                system_message += progress_text
            
            if rag_context:
                system_message += f"\n\nRelevant Knowledge:\n{rag_context}\n"
            
            langchain_messages = [SystemMessage(content=system_message)]
            
            for msg in messages[-6:]:
                if msg["role"] == "user":
                    langchain_messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    langchain_messages.append(AIMessage(content=msg["content"]))
            
            try:
                response = llm_with_tools.invoke(langchain_messages)
            except Exception as e:
                logger.error(f"Error invoking LLM: {e}")
                response = llm.invoke(langchain_messages)
            
            langchain_messages.append(response)
            
            tool_calls = getattr(response, 'tool_calls', []) or []
            
            if tool_calls:
                for tool_call in tool_calls:
                    tool_name = tool_call.get("name", "")
                    tool_args = tool_call.get("args", {})
                    tool_args["user_id"] = self.user_id
                    
                    tool_func = next((t for t in self.tools if t.name == tool_name), None)
                    if tool_func:
                        try:
                            result = tool_func.invoke(tool_args)
                            tool_message = ToolMessage(
                                content=str(result),
                                tool_call_id=tool_call.get("id", "")
                            )
                            langchain_messages.append(tool_message)
                            
                            if tool_name == "update_user_profile" and isinstance(result, dict):
                                profile = self.memory.get_user_profile()
                                user_profile = profile.model_dump(exclude_none=True) if profile else {}
                            
                        except Exception as e:
                            logger.error(f"Error calling tool {tool_name}: {e}")
                            tool_message = ToolMessage(
                                content=f"Error: {str(e)}",
                                tool_call_id=tool_call.get("id", "")
                            )
                            langchain_messages.append(tool_message)
                
                final_response = llm.invoke(langchain_messages)
                response_content = final_response.content
            else:
                response_content = response.content
            
            end_time = datetime.utcnow()
            latency_ms = (end_time - start_time).total_seconds() * 1000
            
            coach_response = CoachResponse(
                message=response_content,
                recommendations=[],
                follow_up_question=None
            )
            
            state["response"] = coach_response.model_dump()
            
            if not state.get("metadata"):
                state["metadata"] = {}
            state["metadata"]["latency_ms"] = round(latency_ms, 2)
            state["metadata"]["completed_at"] = end_time.isoformat()
            
            return state
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            coach_response = CoachResponse(
                message="I apologize, but I encountered an error. Please try again.",
                recommendations=[],
                follow_up_question=None
            )
            state["response"] = coach_response.model_dump()
            return state
    
    def process_message(self, user_message: str) -> dict:
        metadata = {
            "tokens_used": 0,
            "confidence": 1.0
        }
        
        self.memory.add_message("user", user_message, metadata=metadata)
        
        conversation_memory = self.memory.get_conversation_memory(limit=30)
        
        state: GraphState = {
            "messages": conversation_memory,
            "user_id": self.user_id,
            "user_profile": {},
            "user_session_data": {},
            "user_progress_data": {},
            "rag_context": "",
            "next_action": "",
            "intent": "simple_query",
            "response": {},
            "metadata": {}
        }
        
        final_state = self.graph.invoke(state)
        
        response = final_state.get("response", {})
        response_message = response.get("message", "I'm here to help with your fitness journey!")
        
        response_metadata = final_state.get("metadata", {})
        self.memory.add_message("assistant", response_message, metadata=response_metadata)
        
        return response
