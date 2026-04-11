import re
import uuid
from typing import Any

from openai import OpenAI
from werkzeug.datastructures import FileStorage

import app.settings as s
from app.extensions import db
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.user_repository import UserRepository
from app.utils.prompts import (
    assistant_instructions_v2,
    motivational_messages_instructions,
)
from app.utils.utils import build_gpt_generator_request, parse_answer


class ChatService:
    def __init__(self, openai_client: OpenAI) -> None:
        self.openai_client = openai_client
        self._conversation_repo = ConversationRepository()
        self._user_repo = UserRepository()

    def handle_message(self, user_message: str | None, user_id: uuid.UUID) -> tuple[str, bool]:
        if not user_message:
            return "No message received", False

        conversation = self._conversation_repo.get_by_user(user_id)
        is_new = conversation is None

        if is_new:
            conversation = self._conversation_repo.get_or_create(user_id)
            if conversation is None:
                raise RuntimeError("Failed to create conversation")
            self._conversation_repo.add_message(
                conversation.id, "system", assistant_instructions_v2
            )

        if conversation is None:
            raise RuntimeError("Failed to load conversation before sending message")

        self._conversation_repo.add_message(conversation.id, "user", user_message)
        db.session.flush()

        conversation = self._conversation_repo.get_by_user(user_id)
        if not conversation:
            raise RuntimeError("Failed to load conversation")

        history = [{"role": m.role, "content": m.content} for m in conversation.messages]
        response = self.generate_bot_response(history, self.openai_client, s.OPENAI_MODEL)

        self._conversation_repo.add_message(conversation.id, "assistant", response)
        db.session.flush()

        return response, is_new

    @staticmethod
    def generate_bot_response(
        conversation_history: list[dict[str, str]], client: OpenAI, model: str
    ) -> str:
        messages: list[Any] = [
            {"role": m["role"], "content": m["content"]} for m in conversation_history
        ]
        completion_raw = client.chat.completions.create(model=model, messages=messages)
        completion = completion_raw.choices[0].message.content or ""

        match = re.search(r'Bot: "(.*?)"', completion)
        return match.group(1) or completion if match else completion

    def transcribe_audio(self, audio_content: FileStorage) -> str:
        file_path = "audio.ogg"
        audio_content.save(file_path)
        with open(file_path, "rb") as audio_input:
            response = self.openai_client.audio.transcriptions.create(
                model="whisper-1", file=audio_input
            )
        return response.text

    def generate_motivational_phrases(self) -> dict[str, Any] | None:
        message_for_bot = build_gpt_generator_request(motivational_messages_instructions)
        answer = self.generate_bot_response(
            message_for_bot, self.openai_client, s.INTERNAL_OPENAI_MODEL
        )
        return parse_answer(answer)
