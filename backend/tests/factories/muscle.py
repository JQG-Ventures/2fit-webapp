from __future__ import annotations

import factory

from app.models.muscle import Muscle
from tests.factories.base import BaseFactory


class MuscleFactory(BaseFactory):
    class Meta:
        model = Muscle

    code = factory.Sequence(lambda n: f"test_muscle_{n}")
    name = factory.Sequence(lambda n: f"Test Muscle {n}")
    body_region = "upper"
    visual_cluster = "chest"
    heatmap_slot = "chest_main"
    sort_order = factory.Sequence(lambda n: n)
