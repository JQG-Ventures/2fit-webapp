"""Minimal stubs for Pylance (tighter than ``Any`` for decorators)."""

from collections.abc import Callable
from typing import Any, TypeVar

F = TypeVar("F", bound=Callable[..., Any])

def jwt_required(
    optional: bool = False,
    fresh: bool = False,
    refresh: bool = False,
    locations: str | tuple[str, ...] | list[str] | None = None,
    verify_type: bool = True,
    skip_revocation_check: bool = False,
) -> Callable[[F], F]: ...

def get_jwt_identity() -> Any: ...
