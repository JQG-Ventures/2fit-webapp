from __future__ import annotations

import factory

from app.models.challenge import Challenge, ChallengeDay, ChallengeDayExercise
from tests.factories.base import BaseFactory
from tests.factories.exercise import ExerciseFactory


class ChallengeFactory(BaseFactory):
    class Meta:
        model = Challenge

    name = factory.Sequence(lambda n: f"Challenge {n}")
    description = "Test challenge"
    plan_type = "challenge"
    duration_days = 30
    price = 0.0
    image_url = "https://example.com/ch.png"
    video_url = "https://example.com/ch.mp4"
    intensity = True
    equipment = None
    category = factory.LazyFunction(lambda: ["strength"])
    level = "beginner"
    is_active = True


class ChallengeDayFactory(BaseFactory):
    class Meta:
        model = ChallengeDay

    challenge = factory.SubFactory(ChallengeFactory)
    sequence_day = factory.Sequence(lambda n: n + 1)
    name = factory.LazyAttribute(lambda o: f"Day {o.sequence_day}")
    is_rest = False


class ChallengeDayExerciseFactory(BaseFactory):
    class Meta:
        model = ChallengeDayExercise

    challenge_day = factory.SubFactory(ChallengeDayFactory)
    exercise = factory.SubFactory(ExerciseFactory)
    sets = 3
    reps = 12
    rest_seconds = 60
