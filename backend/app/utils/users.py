from __future__ import annotations

import logging
from functools import wraps
from typing import Any, Callable

from flask import abort
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from werkzeug.security import check_password_hash


def validate_user_by_credentials(user: Any, password: str) -> bool:
    try:
        password_hash = (
            user.password_hash if hasattr(user, "password_hash") else user.get("password_hash")
        )
        if not isinstance(password_hash, str):
            return False
        return check_password_hash(password_hash, password)
    except Exception as e:
        logging.exception(f"{e}")
        return False


def roles_required(required_roles: list[str]) -> Callable[..., Callable[..., object]]:
    def decorator(fn: Callable[..., object]) -> Callable[..., object]:
        @wraps(fn)
        def wrapper(*args: object, **kwargs: object) -> object | None:
            verify_jwt_in_request()
            claims = get_jwt()
            roles = claims.get("roles", [])
            if any(role in roles for role in required_roles):
                return fn(*args, **kwargs)
            else:
                abort(403)
                raise RuntimeError("Unreachable")

        return wrapper

    return decorator
