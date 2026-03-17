"""
Module defining data structures to represent a user's progress in a fitness challenge.

This module contains typed dictionaries for modeling daily challenge activity and overall
challenge progress, including completion status, daily exercise logs, and metadata.
"""

from typing import Any, TypedDict


class ChallengeDay(TypedDict):
    """
    Represents a single day in a challenge.

    Attributes:
        sequence_day (int): The sequence number of the day in the challenge.
        date (str): The date the challenge day is scheduled or completed (ISO format).
        is_completed (bool): Whether the user completed the day's workout.
        status (str): Status of the day (e.g., "completed", "pending", "rest").
        exercises (List[dict[str, Any]]): List of exercises for the day,
        including details like sets, reps, and IDs.
    """

    sequence_day: int
    date: str
    is_completed: bool
    status: str
    exercises: list[dict[str, Any]]


class ChallengeProgress(TypedDict):
    """
    Represents a user's progress through a fitness challenge.

    Attributes:
        challenge_id (str): Unique identifier for the challenge.
        name (str): Name of the challenge.
        total_days (int): Total number of days in the challenge.
        progress (float): User's progress as a percentage (0.0 to 1.0).
        days (List[ChallengeDay]): List of daily progress entries.
    """

    challenge_id: str
    name: str
    total_days: int
    progress: float
    days: list[ChallengeDay]
