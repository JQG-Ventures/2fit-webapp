"""JWT Authorization headers for Flask test client."""

from __future__ import annotations

import uuid

from flask import Flask
from flask_jwt_extended import create_access_token


def auth_headers(app: Flask, user_id: str | None = None) -> dict[str, str]:
    uid = user_id if user_id is not None else str(uuid.uuid4())
    with app.app_context():
        token = create_access_token(identity=uid)
    return {"Authorization": f"Bearer {token}"}
