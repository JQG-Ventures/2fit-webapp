"""Factory Boy base wired to Flask-SQLAlchemy ``db.session``."""

from __future__ import annotations

import factory

from app.extensions import db


class BaseFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        abstract = True
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"
