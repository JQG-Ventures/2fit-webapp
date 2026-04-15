"""Integration tests for ``role_required`` (via real admin routes)."""

from __future__ import annotations

import uuid
from unittest.mock import MagicMock, patch

import pytest

from tests.db_checks import postgres_reachable
from tests.helpers.jwt_headers import auth_headers

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


def test_role_required_unknown_user_returns_404(app, client, db) -> None:
    headers = auth_headers(app, str(uuid.uuid4()))
    r = client.get("/api/azure/content?tags=a", headers=headers)
    assert r.status_code == 404
    body = r.get_json()
    assert body is not None
    assert "not found" in body.get("message", "").lower()


@patch("app.routes.content.AzureService")
def test_role_required_insufficient_permissions(mock_azure, app, client, db, sample_user) -> None:
    mock_azure.return_value = MagicMock()
    headers = auth_headers(app, str(sample_user.id))
    r = client.get("/api/azure/content?tags=x", headers=headers)
    assert r.status_code == 403
