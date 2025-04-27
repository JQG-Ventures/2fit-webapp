from __future__ import annotations
from werkzeug.security import check_password_hash
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from flask import abort
from typing import Callable, Optional

import logging


def validate_user_by_credentials(user: dict, password: str) -> bool:
    """
    Validate user credentials
    Args:
        user (dict): User data from db
        password (str): User password

    Returns:
        bool: True if the password matches, False otherwise.
    """

    try:
        hashed_password = user["password_hash"]
        return check_password_hash(hashed_password, password)
    except Exception as e:
        logging.exception(f"{e}")
        return False


def roles_required(required_roles: list[str]) -> Callable[..., Callable[..., object]]:
    def decorator(fn: Callable[..., object]) -> Callable[..., object]:
        @wraps(fn)
        def wrapper(*args: object, **kwargs: object) -> Optional[object]:
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
