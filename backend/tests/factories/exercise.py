from __future__ import annotations

import factory

from app.models.exercise import Exercise
from tests.factories.base import BaseFactory


class ExerciseFactory(BaseFactory):
    class Meta:
        model = Exercise

    name = factory.Sequence(lambda n: f"Test Exercise {n}")
    description = factory.LazyAttribute(lambda o: f"Description for {o.name}")
    category = "strength"
    image_url = "https://example.com/image.png"
    video_url = "https://example.com/video.mp4"
    muscle_group = factory.LazyFunction(lambda: ["chest", "triceps"])
    difficulty = "beginner"
    equipment = factory.LazyFunction(lambda: ["dumbbells"])
    instructions = factory.LazyFunction(lambda: ["Step one", "Step two"])
    contradictions = factory.LazyFunction(list)
    is_active = True
