from __future__ import annotations

import logging
import os
import uuid as uuid_mod
from typing import IO, Optional

from azure.storage.blob import BlobServiceClient

import app.settings as s
from app.extensions import db
from app.models.content import Content


class AzureService:
    def __init__(self) -> None:
        if not s.AZURE_CONNECTION_STRING:
            raise ValueError("AZURE_CONNECTION_STRING is not set.")
        self.blob_service_client = BlobServiceClient.from_connection_string(
            s.AZURE_CONNECTION_STRING
        )

    def upload_content(
        self, file_path: str, title: str, description: str, tags: list[str]
    ) -> Optional[str]:
        try:
            file_name = os.path.basename(file_path)

            if not s.AZURE_CONTAINER_NAME:
                raise ValueError("AZURE_CONTAINER_NAME is not set.")

            blob_client = self.blob_service_client.get_blob_client(
                container=s.AZURE_CONTAINER_NAME, blob=file_name
            )
            with open(file_path, "rb") as data:
                blob_client.upload_blob(data)

            content = Content(
                title=title,
                description=description,
                tags=tags,
                file_path=file_name,
                blob_url=blob_client.url,
            )
            db.session.add(content)
            db.session.flush()

            return str(content.id)
        except Exception as e:
            logging.exception(f"Error uploading blob to Azure: {e}")
            return None

    def get_content_by_tags(self, tags: list[str]) -> Optional[str]:
        try:
            from sqlalchemy import select

            stmt = select(Content).where(Content.tags.overlap(tags))
            content = db.session.scalars(stmt).first()
            if content:
                return str(content.blob_url)
            return None
        except Exception as e:
            logging.exception(f"Could not get content from DB: {e}")
            return None

    def upload_profile_image(
        self, file_stream: IO[bytes], user_id: str, original_filename: str
    ) -> Optional[str]:
        try:
            extension = (
                original_filename.rsplit(".", 1)[1].lower() if "." in original_filename else "png"
            )
            unique_filename = f"profile_{uuid_mod.uuid4().hex}.{extension}"
            blob_path = f"{user_id}/{unique_filename}"

            blob_client = self.blob_service_client.get_blob_client(
                container=s.AZURE_PROFILE_CONTAINER_NAME, blob=blob_path
            )
            file_stream.seek(0)
            blob_client.upload_blob(file_stream, overwrite=True)
            return str(blob_client.url)
        except Exception as e:
            logging.exception("Error uploading profile image: %s", e)
            return None
