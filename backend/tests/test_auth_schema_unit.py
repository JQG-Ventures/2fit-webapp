from __future__ import annotations

import pytest

from app.routes.authentication import _resolve_login_identifier
from app.schemas.auth import LoginRequest

pytestmark = pytest.mark.unit


def test_login_request_normalizes_email_and_phone() -> None:
    schema = LoginRequest(
        email="  MixedCase@Example.com  ",
        phone="  +15551112222  ",
        password="secret",
    )

    assert schema.email == "mixedcase@example.com"
    assert schema.phone == "+15551112222"


def test_resolve_login_identifier_prefers_email_then_phone() -> None:
    email_schema = LoginRequest(email="USER@example.com", password="secret")
    phone_schema = LoginRequest(phone="  +15551112222  ", password="secret")

    assert _resolve_login_identifier(email_schema) == "user@example.com"
    assert _resolve_login_identifier(phone_schema) == "+15551112222"


def test_login_request_maps_blank_identifiers_to_none() -> None:
    schema = LoginRequest(email="   ", phone="   ", password="secret")

    assert schema.email is None
    assert schema.phone is None
    assert _resolve_login_identifier(schema) is None
