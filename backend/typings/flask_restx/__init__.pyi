"""Minimal stubs for Pylance (``flask_restx`` ships without inline types)."""

from typing import Any, Callable, TypeVar

R = TypeVar("R", bound=type)

class Resource:
    def dispatch_request(self, *args: Any, **kwargs: Any) -> Any: ...

class Api:
    def __init__(self, app: Any, *args: Any, **kwargs: Any) -> None: ...
    def route(self, path: str, **kwargs: Any) -> Callable[[R], R]: ...
