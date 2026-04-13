from __future__ import annotations

import factory

from app.models.email import Email
from tests.factories.base import BaseFactory


class EmailFactory(BaseFactory):
    class Meta:
        model = Email

    email = factory.Sequence(lambda n: f"queued{n}@example.com")
