from app.agent import AgentService
from flask import Blueprint, request
from flask_restx import Api, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from typing import Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

agent_chat_bp = Blueprint("agent_chat_bp", __name__)
api = Api(agent_chat_bp, doc="/docs")

agent_message_model = api.model(
    "AgentMessage",
    {"message": fields.String("Message for the fitness coach agent", required=True)},
)

agent_response_model = api.model(
    "AgentResponse",
    {
        "message": fields.String("Main response from the coach"),
        "recommendations": fields.List(fields.String(), description="List of recommendations"),
        "follow_up_question": fields.String("Optional follow-up question"),
    },
)


@agent_chat_bp.before_app_request
def before_request() -> Optional[Tuple[dict, int]]:
    return None


@api.route("/agent/chat")
class AgentChatResource(Resource):
    @jwt_required()
    @api.expect(agent_message_model)
    @api.doc("chat_with_agent")
    @api.response(200, "Success")
    @api.response(400, "Bad Request")
    @api.response(500, "Internal Server Error")
    @api.marshal_with(agent_response_model)
    def post(self) -> tuple[dict[str, any], int]:
        try:
            user_id = get_jwt_identity()
            if not user_id:
                return {"error": "User not authenticated"}, 401

            data = request.json
            if data is None or "message" not in data:
                return {"error": "Missing message in request body"}, 400

            user_message = data.get("message", "").strip()
            if not user_message:
                return {"error": "Message cannot be empty"}, 400

            logger.info(f"Processing message from user {user_id}: {user_message}")

            response = AgentService.process_message(user_id, user_message)

            return response, 200

        except Exception as e:
            logger.exception(f"Error processing agent message: {e}")
            return {
                "message": "I apologize, but I encountered an error processing your message. Please try again.",
                "recommendations": [],
                "follow_up_question": None
            }, 500


@api.route("/agent/conversation")
class AgentConversationResource(Resource):
    @jwt_required()
    @api.doc("get_conversation")
    @api.response(200, "Success")
    @api.response(401, "Unauthorized")
    def get(self) -> tuple[dict[str, any], int]:
        try:
            user_id = get_jwt_identity()
            if not user_id:
                return {"error": "User not authenticated"}, 401

            from app.agent.memory import MemoryManager
            memory = MemoryManager(user_id)
            messages = memory.get_conversation_memory(limit=50)
            
            serializable_messages = []
            for msg in messages:
                serializable_msg = msg.copy()
                if isinstance(serializable_msg.get("timestamp"), datetime):
                    serializable_msg["timestamp"] = serializable_msg["timestamp"].isoformat()
                serializable_messages.append(serializable_msg)

            return {"status": "success", "message": serializable_messages}, 200

        except Exception as e:
            logger.exception(f"Error retrieving conversation: {e}")
            return {"error": "Could not retrieve conversation"}, 500


@api.route("/agent/conversation/clear")
class AgentClearConversationResource(Resource):
    @jwt_required()
    @api.doc("clear_conversation")
    @api.response(200, "Success")
    @api.response(401, "Unauthorized")
    def post(self) -> tuple[dict[str, str], int]:
        try:
            user_id = get_jwt_identity()
            if not user_id:
                return {"error": "User not authenticated"}, 401

            from app.agent.memory import MemoryManager
            memory = MemoryManager(user_id)
            memory.clear_conversation()

            return {"status": "success", "message": "Conversation cleared"}, 200

        except Exception as e:
            logger.exception(f"Error clearing conversation: {e}")
            return {"error": "Could not clear conversation"}, 500
