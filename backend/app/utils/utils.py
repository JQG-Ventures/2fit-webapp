from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from typing import Union

import json
import logging
import re


def build_gpt_generator_request(prompt: str) -> list:
    """
    Contact OpenAI API to generate the user profile based on the conversation.

    Args:
        prompt (str): The prompt to send to the bot as an instruction.

    Returns:
        str: Body of the message to sent to GPT model.
    """

    request_message = [{"role": "user", "content": prompt}]

    return request_message


def format_json_string(answer: str) -> str:
    """
    Format the text returned by GPT to format it in text prepare for JSON formatting.

    Args:
        answer (str): Chat GPT answers to generate motivational messages prompt.

    Returns:
        str: Formatted string JSON for JSON encoding.
    """
    answer = re.sub(r"(?<=\s)(\w+)(?=\s*:)", r'"\1"', answer)
    answer = re.sub(r'(?<=\w)"\s*"', r'", "', answer)
    answer = re.sub(r",(\s*[}\]])", r"\1", answer)

    return answer


def parse_answer(answer: str):
    """
    Parse the string to JSON format for API return content.

    Args:
        answer (str): String formatted for JSON content.

    Returns:
        str: Formatted JSON object for API response.
    """
    try:
        formatted_answer = format_json_string(answer)
        json_match = re.search(r"{.*}", formatted_answer, re.DOTALL)

        if json_match:
            json_string = json_match.group(0)
            return json.loads(json_string)
        else:
            raise ValueError("No valid JSON object found in the string.")
    except (json.JSONDecodeError, ValueError, TypeError) as e:
        logging.error(f"Error decoding JSON: {e}")
        return None


def generate_user_routine(user_profile: dict, fitness_level: str, plan):
    plan = {
        "name": f"Auto Plan {user_profile['name']}",
        "description": f"A workout plan for the user {user_profile['_id']}",
        "plan_type": "personalized",
        "duration_weeks": 12,
        "price": 0.0,
        "image_url": "",
        "video_url": "",
        "level": fitness_level,
        "is_active": True,
        "workout_schedule": plan,
    }
    logging.info(f"Workout routine for user {user_profile['_id']} generated: {plan}")
    return plan


def convert_to_objectid(id_value: str) -> Union[ObjectId, str]:
    """Convert string ID to ObjectId if possible."""
    try:
        return ObjectId(id_value)
    except InvalidId:
        return id_value


def parse_date(date_str):
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Invalid date format: {date_str}")
