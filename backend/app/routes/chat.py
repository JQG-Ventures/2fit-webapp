from __future__ import annotations

import logging
import uuid

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Api, Resource
from openai import OpenAI

import app.settings as s
from app.extensions import db
from app.services.chat_service import ChatService

chat_bp = Blueprint("chat_bp", __name__)
api = Api(chat_bp, doc="/docs")
logger = logging.getLogger(__name__)


@api.route("/chat")
class ChatBotResource(Resource):
    @jwt_required()
    def post(self) -> tuple[dict[str, str], int]:
        data = request.json
        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400

        chat_service = ChatService(OpenAI(api_key=s.OPENAI_API_KEY))
        user_id = get_jwt_identity()

        try:
            response, is_new = chat_service.handle_message(data.get("message"), uuid.UUID(user_id))
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            logger.exception(f"Chat error: {e}")
            return {"error": "Could not handle the message"}, 500

        status_code = 201 if is_new else 200
        message = "Conversation initiated" if is_new else "Conversation continued"
        return {"message": message, "response": response}, status_code


@api.route("/transcribe")
class TranscribeResource(Resource):
    def post(self) -> tuple[dict[str, str], int]:
        try:
            audio_file = request.files["file"]
            chat_service = ChatService(OpenAI(api_key=s.OPENAI_API_KEY))
            response = chat_service.transcribe_audio(audio_file)
            return {"response": response}, 200
        except Exception as e:
            logger.exception(f"Transcription error: {e}")
            return {"error": "Could not handle the message"}, 500
