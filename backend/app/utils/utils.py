import json
import logging
import re
from datetime import datetime
from typing import Any, Optional


def build_gpt_generator_request(prompt: str) -> list[dict[str, str]]:
    return [{"role": "user", "content": prompt}]


def format_json_string(answer: str) -> str:
    answer = re.sub(r"(?<=\s)(\w+)(?=\s*:)", r'"\1"', answer)
    answer = re.sub(r'(?<=\w)"\s*"', r'", "', answer)
    answer = re.sub(r",(\s*[}\]])", r"\1", answer)
    return answer


def parse_answer(answer: str) -> Optional[dict[str, Any]]:
    try:
        formatted_answer = format_json_string(answer)
        json_match = re.search(r"{.*}", formatted_answer, re.DOTALL)
        if json_match:
            json_string = json_match.group(0)
            return json.loads(json_string)  # type: ignore[no-any-return]
        raise ValueError("No valid JSON object found in the string.")
    except (json.JSONDecodeError, ValueError, TypeError) as e:
        logging.error(f"Error decoding JSON: {e}")
        return None


def parse_date(date_str: str) -> datetime:
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Invalid date format: {date_str}")
