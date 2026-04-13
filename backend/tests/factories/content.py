from __future__ import annotations

import factory

from app.models.content import Content
from tests.factories.base import BaseFactory


class ContentFactory(BaseFactory):
    class Meta:
        model = Content

    title = factory.Sequence(lambda n: f"Content {n}")
    description = "Desc"
    tags = factory.LazyFunction(lambda: ["tag"])
    file_path = "/path/file"
    blob_url = "https://blob.example.com/x"
