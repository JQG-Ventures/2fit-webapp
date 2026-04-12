"""Shared pytest fixtures for Flask app and JWT-authenticated requests."""

from __future__ import annotations

import uuid

import pytest
from flask import Flask
from flask.testing import FlaskClient
from flask_jwt_extended import create_access_token


@pytest.fixture()
def app() -> Flask:
    from app import create_app

    application = create_app()
    application.config["TESTING"] = True
    return application


@pytest.fixture()
def client(app: Flask) -> FlaskClient:
    return app.test_client()


def auth_headers(app: Flask, user_id: str | None = None) -> dict[str, str]:
    """Return Authorization header with a valid access token for ``user_id``."""
    uid = user_id if user_id is not None else str(uuid.uuid4())
    with app.app_context():
        token = create_access_token(identity=uid)
    return {"Authorization": f"Bearer {token}"}
