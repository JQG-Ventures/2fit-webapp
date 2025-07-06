from typing import Any, TypedDict, List


class ChallengeDay(TypedDict):
    sequence_day: int
    date: str
    is_completed: bool
    status: str
    exercises: List[dict[str, Any]]


class ChallengeProgress(TypedDict):
    challenge_id: str
    name: str
    total_days: int
    progress: float
    days: List[ChallengeDay]
