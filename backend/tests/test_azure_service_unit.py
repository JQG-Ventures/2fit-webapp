"""Unit tests for ``AzureService`` (SDK and DB mocked)."""

from __future__ import annotations

import uuid
from io import BytesIO
from unittest.mock import MagicMock, mock_open, patch

import pytest

pytestmark = pytest.mark.unit


@patch("app.services.azure_service.BlobServiceClient")
@patch("app.services.azure_service.s")
def test_init_raises_without_connection_string(mock_s: MagicMock, _blob: MagicMock) -> None:
    mock_s.AZURE_CONNECTION_STRING = ""
    from app.services.azure_service import AzureService

    with pytest.raises(ValueError, match="AZURE_CONNECTION_STRING"):
        AzureService()


@patch("app.services.azure_service.db.session.flush")
@patch("app.services.azure_service.db.session.add")
@patch("app.services.azure_service.BlobServiceClient")
@patch("app.services.azure_service.s")
def test_upload_content_success(
    mock_s: MagicMock, _blob_cls: MagicMock, mock_add: MagicMock, _flush: MagicMock
) -> None:
    mock_s.AZURE_CONNECTION_STRING = "UseDevelopmentStorage=true"
    mock_s.AZURE_CONTAINER_NAME = "c1"
    blob = MagicMock()
    blob.url = "https://example.blob.core.windows.net/c1/file.txt"
    client = MagicMock()
    client.get_blob_client.return_value = blob
    _blob_cls.from_connection_string.return_value = client

    fake_content = MagicMock()
    fake_content.id = uuid.uuid4()

    with patch("app.services.azure_service.Content", return_value=fake_content):
        from app.services.azure_service import AzureService

        svc = AzureService()
        with patch("builtins.open", mock_open(read_data=b"data")):
            out = svc.upload_content("/tmp/file.txt", "t", "d", ["a"])

    assert out == str(fake_content.id)
    blob.upload_blob.assert_called_once()


@patch("app.services.azure_service.BlobServiceClient")
@patch("app.services.azure_service.s")
def test_upload_content_returns_none_on_missing_container(
    mock_s: MagicMock, _blob_cls: MagicMock
) -> None:
    mock_s.AZURE_CONNECTION_STRING = "x"
    mock_s.AZURE_CONTAINER_NAME = ""
    from app.services.azure_service import AzureService

    svc = AzureService()
    assert svc.upload_content("/a/b.txt", "t", "d", []) is None


@patch("app.services.azure_service.logging.exception")
@patch("app.services.azure_service.BlobServiceClient")
@patch("app.services.azure_service.s")
def test_upload_content_returns_none_on_blob_error(
    mock_s: MagicMock, _blob_cls: MagicMock, _log: MagicMock
) -> None:
    mock_s.AZURE_CONNECTION_STRING = "x"
    mock_s.AZURE_CONTAINER_NAME = "c"
    client = MagicMock()
    client.get_blob_client.return_value.upload_blob.side_effect = OSError("net")
    _blob_cls.from_connection_string.return_value = client
    from app.services.azure_service import AzureService

    svc = AzureService()
    with patch("builtins.open", mock_open(read_data=b"x")):
        assert svc.upload_content("/tmp/x.txt", "t", "d", []) is None


@patch("app.services.azure_service.logging.exception")
@patch("app.services.azure_service.db.session.scalars")
@patch("app.services.azure_service.BlobServiceClient")
@patch("app.services.azure_service.s")
def test_get_content_by_tags_returns_url(
    mock_s: MagicMock, _blob_cls: MagicMock, mock_scalars: MagicMock, _log: MagicMock
) -> None:
    mock_s.AZURE_CONNECTION_STRING = "x"
    row = MagicMock()
    row.blob_url = "https://blob/x"
    mock_result = MagicMock()
    mock_result.first.return_value = row
    mock_scalars.return_value = mock_result
    from app.services.azure_service import AzureService

    svc = AzureService()
    assert svc.get_content_by_tags(["a"]) == "https://blob/x"


@patch("app.services.azure_service.logging.exception")
@patch("app.services.azure_service.db.session.scalars")
@patch("app.services.azure_service.BlobServiceClient")
@patch("app.services.azure_service.s")
def test_get_content_by_tags_returns_none_when_empty(
    mock_s: MagicMock, _blob_cls: MagicMock, mock_scalars: MagicMock, _log: MagicMock
) -> None:
    mock_s.AZURE_CONNECTION_STRING = "x"
    mock_result = MagicMock()
    mock_result.first.return_value = None
    mock_scalars.return_value = mock_result
    from app.services.azure_service import AzureService

    svc = AzureService()
    assert svc.get_content_by_tags(["z"]) is None


@patch("app.services.azure_service.logging.exception")
@patch("app.services.azure_service.db.session.scalars")
@patch("app.services.azure_service.BlobServiceClient")
@patch("app.services.azure_service.s")
def test_get_content_by_tags_returns_none_on_db_error(
    mock_s: MagicMock, _blob_cls: MagicMock, mock_scalars: MagicMock, _log: MagicMock
) -> None:
    mock_s.AZURE_CONNECTION_STRING = "x"
    mock_scalars.side_effect = RuntimeError("db")
    from app.services.azure_service import AzureService

    svc = AzureService()
    assert svc.get_content_by_tags(["a"]) is None


@patch("app.services.azure_service.BlobServiceClient")
@patch("app.services.azure_service.s")
def test_upload_profile_image_success(mock_s: MagicMock, _blob_cls: MagicMock) -> None:
    mock_s.AZURE_CONNECTION_STRING = "x"
    mock_s.AZURE_PROFILE_CONTAINER_NAME = "profiles"
    blob = MagicMock()
    blob.url = "https://u"
    client = MagicMock()
    client.get_blob_client.return_value = blob
    _blob_cls.from_connection_string.return_value = client
    from app.services.azure_service import AzureService

    svc = AzureService()
    stream = BytesIO(b"png-bytes")
    assert svc.upload_profile_image(stream, str(uuid.uuid4()), "p.png") == "https://u"


@patch("app.services.azure_service.logging.exception")
@patch("app.services.azure_service.BlobServiceClient")
@patch("app.services.azure_service.s")
def test_upload_profile_image_returns_none_on_error(
    mock_s: MagicMock, _blob_cls: MagicMock, _log: MagicMock
) -> None:
    mock_s.AZURE_CONNECTION_STRING = "x"
    mock_s.AZURE_PROFILE_CONTAINER_NAME = "p"
    client = MagicMock()
    client.get_blob_client.return_value.upload_blob.side_effect = ValueError("bad")
    _blob_cls.from_connection_string.return_value = client
    from app.services.azure_service import AzureService

    svc = AzureService()
    assert svc.upload_profile_image(BytesIO(b"x"), "uid", "noext") is None
