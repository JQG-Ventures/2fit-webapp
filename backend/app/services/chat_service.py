"""Service layer for managing chat interactions using OpenAI and MongoDB."""

from app.extensions import mongo
from app.utils.prompts import (
    assistant_instructions_v2,
    motivational_messages_instructions,
)
from app.utils.utils import build_gpt_generator_request, parse_answer
from datetime import datetime
from flask import request
from openai import OpenAI
from typing import Optional, Tuple, Any

import app.settings as s
import logging
import re
import uuid

logging.Logger.root.level = 10


class ChatService:
    """Service class to handle chat logic, GPT integration, and conversation persistence."""

    def __init__(self, openai_client: OpenAI):
        """
        Initialize the ChatService.

        Args:
            openai_client (OpenAI): OpenAI client instance used for generating responses.
        """
        self.openai_client = openai_client

    def handle_message(self, user_message: Optional[str]) -> Tuple[str, bool]:
        """
        Handle incoming user messages.

        Interacts with the OpenAI API and updates the user conversation in MongoDB.

        Args:
            user_message (str): The user's message.

        Returns:
            tuple: The GPT response and a boolean indicating if it’s a new conversation.
        """
        if not user_message:
            return "No message received", False

        user_id = f"user_{request.headers.get('User-Phone-Number')}"
        conversation = mongo.db.conversations.find_one({"user_id": user_id})

        if not conversation:
            logging.info(f"No conversations found for user {user_id}")
            conversation_id = str(uuid.uuid4())
            self.update_conversation(user_id, conversation_id, assistant_instructions_v2, "system")
        else:
            conversation_id = conversation["conversation_id"]

        logging.info(f"Message to sent to the bot: {user_message}, for user id: {user_id}")
        self.update_conversation(user_id, conversation_id, user_message, "user")
        conversation_history = self.get_conversation_messages_by_id(conversation_id)
        response = self.generate_bot_response(
            conversation_history, self.openai_client, s.OPENAI_MODEL
        )
        logging.info(f"Response from bot to user {user_id}: {response}")
        self.update_conversation(user_id, conversation_id, response, "assistant")

        return response, not bool(conversation)

    @staticmethod
    def get_conversation_messages_by_id(
        conversation_id: str,
    ) -> list[dict[str, str]]:
        """
        Get the conversation messages list by conversation ID.

        Args:
            conversation_id (str): ID of the conversation to retrieve the messages from.

        Returns:
            list[dict[str, str]]: List of messages.
        """
        result: Any = mongo.db.conversations.find_one({"conversation_id": conversation_id})

        if result and isinstance(result.get("messages"), list):
            return list(result["messages"])

        raise KeyError(f"Conversation not saved in Mongo for conversation_id {conversation_id}")

    @staticmethod
    def generate_bot_response(
        conversation_history: list[dict[str, str]], client: OpenAI, model: str
    ) -> str:
        """
        Contact OpenAI API to send a message to a GPT and get the response.

        Args:
            conversation_history (list): List of the message history with the GPT.
            client (OpenAI): Instance of the OpenAI client to call the OpenAI API.
            model (str): Model of GPT to use in the request.

        Returns:
            str: GPT answers to the latest message query from user.
        """
        messages: list[Any] = [
            {"role": m["role"], "content": m["content"]} for m in conversation_history
        ]

        completion_raw = client.chat.completions.create(model=model, messages=messages)
        completion = completion_raw.choices[0].message.content or ""

        match = re.search(r'Bot: "(.*?)"', completion)
        return match.group(1) or completion if match else completion

    def transcribe_audio(self, audio_content) -> str:
        """
        Contact OpenAI API to transcribe an useraudi and get the response.

        Args:
            audio_content (bytes): User audio.

        Returns:
            str: User audio transcription.
        """
        client = self.openai_client

        file_path = "audio.ogg"
        audio_content.save(file_path)
        audio_input = open(file_path, "rb")

        response = client.audio.transcriptions.create(model="whisper-1", file=audio_input)

        transcription_text = response.text
        return transcription_text

    @staticmethod
    def update_conversation(user_id: str, conversation_id: str, message: str, role: str) -> None:
        """
        Update the conversation with a new message.

        Args:
            conversation_id (str): The ID of the conversation.
            user_id (str): The ID of the user.
            message (str): The message content.
            role (str): The sender role ("user" or "assistant").
        """
        current_time = datetime.utcnow()

        mongo.db.conversations.update_one(
            {"conversation_id": conversation_id},
            {
                "$setOnInsert": {
                    "created_at": current_time,
                    "user_id": user_id,
                },
                "$set": {"updated_at": current_time},
                "$push": {
                    "messages": {
                        "timestamp": current_time,
                        "role": role,
                        "content": message,
                    }
                },
            },
            upsert=True,
        )

    def generate_motivational_phrases(self):
        """
        Contact OpenAI API to generate a list of motivational messages.

        Returns:
            str: GPT answers to the motivational messages request.
        """
        message_for_bot = build_gpt_generator_request(motivational_messages_instructions)
        answer = self.generate_bot_response(
            message_for_bot, self.openai_client, s.INTERNAL_OPENAI_MODEL
        )
        json_answer = parse_answer(answer)
        return json_answer
