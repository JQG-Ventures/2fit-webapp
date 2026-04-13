"""HTTP tests for ``/api/azure/content/*`` (admin + ``AzureService`` mocked)."""

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from flask import Flask
from flask.testing import FlaskClient
from flask_sqlalchemy import SQLAlchemy
from werkzeug.test import TestResponse

from app.models.user import User
from tests.db_checks import postgres_reachable
from tests.factories import UserFactory
from tests.helpers.jwt_headers import auth_headers

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not postgres_reachable(), reason="PostgreSQL required"),
]


@pytest.fixture
def sample_admin_user(db: SQLAlchemy) -> User:
    user: User = UserFactory.create(roles=["admin"])
    db.session.commit()
    return user


def test_content_upload_requires_jwt(client: FlaskClient, db: SQLAlchemy) -> None:
    r: TestResponse = client.post("/api/azure/content/upload", json={})
    assert r.status_code == 401


def test_content_upload_forbidden_for_non_admin(
    app: Flask,
    client: FlaskClient,
    db: SQLAlchemy,
    sample_user: User,
) -> None:
    headers: dict[str, str] = auth_headers(app, str(sample_user.id))
    r: TestResponse = client.post(
        "/api/azure/content/upload",
        headers=headers,
        json={
            "file_path": "/tmp/x.txt",
            "title": "t",
            "description": "d",
            "tags": "a,b",
        },
    )
    assert r.status_code == 403


@patch("app.routes.content.AzureService")
def test_content_upload_success(
    mock_azure_cls: MagicMock,
    app: Flask,
    client: FlaskClient,
    db: SQLAlchemy,
    sample_admin_user: User,
) -> None:
    instance: MagicMock = MagicMock()
    instance.upload_content.return_value = "content-uuid-123"
    mock_azure_cls.return_value = instance
    headers: dict[str, str] = auth_headers(app, str(sample_admin_user.id))
    r: TestResponse = client.post(
        "/api/azure/content/upload",
        headers=headers,
        json={
            "file_path": "/tmp/x.txt",
            "title": "Title",
            "description": "Desc",
            "tags": "tag1,tag2",
        },
    )
    assert r.status_code == 201
    body: Any = r.get_json()
    assert body is not None
    assert body["content_id"] == "content-uuid-123"


def test_content_upload_missing_fields(
    app: Flask,
    client: FlaskClient,
    db: SQLAlchemy,
    sample_admin_user: User,
) -> None:
    headers: dict[str, str] = auth_headers(app, str(sample_admin_user.id))
    r: TestResponse = client.post(
        "/api/azure/content/upload",
        headers=headers,
        json={"title": "only"},
    )
    assert r.status_code == 400


def test_content_get_requires_tags(
    app: Flask,
    client: FlaskClient,
    db: SQLAlchemy,
    sample_admin_user: User,
) -> None:
    headers: dict[str, str] = auth_headers(app, str(sample_admin_user.id))
    r: TestResponse = client.get("/api/azure/content", headers=headers)
    assert r.status_code == 400


@patch("app.routes.content.AzureService")
def test_content_get_success(
    mock_azure_cls: MagicMock,
    app: Flask,
    client: FlaskClient,
    db: SQLAlchemy,
    sample_admin_user: User,
) -> None:
    instance: MagicMock = MagicMock()
    instance.get_content_by_tags.return_value = "https://blob.example/x"
    mock_azure_cls.return_value = instance
    headers: dict[str, str] = auth_headers(app, str(sample_admin_user.id))
    r: TestResponse = client.get("/api/azure/content?tags=a,b", headers=headers)
    assert r.status_code == 200
    body: Any = r.get_json()
    assert body is not None
    assert body["content_url"] == "https://blob.example/x"


@patch("app.routes.content.AzureService")
def test_content_get_not_found(
    mock_azure_cls: MagicMock,
    app: Flask,
    client: FlaskClient,
    db: SQLAlchemy,
    sample_admin_user: User,
) -> None:
    instance: MagicMock = MagicMock()
    instance.get_content_by_tags.return_value = None
    mock_azure_cls.return_value = instance
    headers: dict[str, str] = auth_headers(app, str(sample_admin_user.id))
    r: TestResponse = client.get("/api/azure/content?tags=z", headers=headers)
    assert r.status_code == 404
