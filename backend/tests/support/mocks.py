"""Lightweight mocks for unit tests that do not use the database."""

from __future__ import annotations

from unittest.mock import MagicMock


def azure_blob_service_mock() -> MagicMock:
    """Patch ``BlobServiceClient`` or ``AzureService`` internals where needed."""
    svc = MagicMock()
    svc.upload_content.return_value = "https://test.blob.core.windows.net/fake"
    svc.blob_service_client = MagicMock()
    return svc


def openai_client_mock() -> MagicMock:
    """Minimal stand-in for chat/completions style clients."""
    client = MagicMock()
    resp = MagicMock()
    resp.choices = [MagicMock(message=MagicMock(content="ok"))]
    client.chat.completions.create.return_value = resp
    return client
