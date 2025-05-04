"""Defines endpoints for chatbot conversation and audio transcription using OpenAI."""

from app.services.chat_service import ChatService
from flask import Blueprint, request
from flask_restx import Api, Resource, fields
from openai import OpenAI
from typing import Optional, Tuple

import app.settings as s
import logging

chat_bp = Blueprint("chat_bp", __name__)
api = Api(chat_bp, doc="/docs")
logger = logging.getLogger(__name__)


chat_bot_model = api.model(
    "ChatBotMessage",
    {"message": fields.String("Message for the bot to answer", required=True)},
)


@chat_bp.before_app_request
def before_request() -> Optional[Tuple[dict, int]]:
    """Execute pre-request logic for each API call.

    Stores user ID and initializes OpenAI client instance based on request headers.
    """
    user_id = f"user_{request.headers.get('User-Phone-Number')}"

    if not user_id:
        return {"error": "User-Phone-Number header is missing"}, 400
    return None


@api.route("/chat")
class ChatBotResource(Resource):
    """Handles interaction with the chatbot, message handling and response generation."""

    @api.expect(chat_bot_model)
    @api.doc("chat_with_bot")
    @api.response(200, "Conversation created!")
    @api.response(201, "Message sent!")
    @api.response(500, "Internal Server Error")
    def post(self) -> tuple[dict[str, str], int]:
        """
        Continues a conversation with the chatbot.

        Returns:
            JSON response with the chatbots reply and status code.
        """
        data = request.json

        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400

        chat_service = ChatService(OpenAI(api_key=s.OPENAI_API_KEY))

        try:
            response, is_new_conversation = chat_service.handle_message(data.get("message"))
        except Exception as e:
            logger.exception(f"There was a problem handling the message, error: {e}")
            return {"error": "Could not handle the message"}, 500

        status_code = 201 if is_new_conversation else 200
        message = "Conversation initiated" if is_new_conversation else "Conversation continued"

        return {"message": message, "response": response}, status_code


@api.route("/transcribe")
class TranscribeResource(Resource):
    """Handles transcription of audio messages using OpenAI Whisper."""

    @api.doc("transcribe_audio")
    @api.response(200, "Transcribed successfully!")
    @api.response(500, "Internal Server Error")
    def post(self) -> tuple[dict[str, str], int]:
        """
        Transcribe user audios.

        Returns:
            JSON response with the transcription and status code.
        """
        try:
            audio_file = request.files["file"]
            chat_service = ChatService(OpenAI(api_key=s.OPENAI_API_KEY))

            response = chat_service.transcribe_audio(audio_file)
            return {"response": response}, 200
        except Exception as e:
            logger.exception(f"There was a problem handling the message, error: {e}")
            return {"error": "Could not handle the message"}, 500
