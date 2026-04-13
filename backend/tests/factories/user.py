from __future__ import annotations

from datetime import date

import factory

from app.models.user import User
from tests.factories.base import BaseFactory


class UserFactory(BaseFactory):
    class Meta:
        model = User

    name = factory.Sequence(lambda n: f"Test{n}")
    last = factory.Sequence(lambda n: f"User{n}")
    age = factory.Sequence(lambda n: 20 + (n % 45))
    birthdate = factory.LazyFunction(lambda: date(1995, 6, 15))
    code_number = factory.Sequence(lambda n: f"{n % 10_000_000_000:010d}")
    country = "US"
    number = factory.Sequence(lambda n: f"+1555{n:08d}")
    gender = "M"
    email = factory.LazyAttribute(lambda o: f"user-{o.number}@test.example.com")
    password_hash = factory.LazyFunction(lambda: "$2b$12$dummyhashfordbtestsnotforauth")
    height = 175
    weight = 75
    target_weight = 72
    fitness_goal = "muscle_gain"
    fitness_level = "intermediate"
