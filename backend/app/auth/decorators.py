from __future__ import annotations

import uuid
from functools import wraps
from typing import Callable

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.repositories.user_repository import UserRepository


def role_required(
    required_roles: list[str],
) -> Callable[[Callable[..., object]], Callable[..., object]]:
    def decorator(fn: Callable[..., object]) -> Callable[..., object]:
        @wraps(fn)
        @jwt_required()
        def decorated_function(*args: object, **kwargs: object) -> object:
            try:
                user_id = get_jwt_identity()
                if not isinstance(user_id, str):
                    return jsonify({"status": "error", "message": "Invalid JWT data"}), 401

                repo = UserRepository()
                user = repo.get_by_id(uuid.UUID(user_id))

                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 404

                if any(role in user.roles for role in required_roles):
                    return fn(*args, **kwargs)

                return jsonify({"status": "error", "message": "Insufficient permissions"}), 403
            except Exception as e:
                return jsonify({"status": "error", "message": str(e)}), 500

        return decorated_function

    return decorator
