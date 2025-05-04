"""Service for handling Azure Blob Storage operations."""

from azure.storage.blob import BlobServiceClient
from typing import Optional, BinaryIO, Any

import app.settings as s
import logging
import os
import uuid


logging.Logger.root.level = 10


class AzureService:
    """Service class for Azure Blob Storage interaction and content handling."""

    def __init__(self, db: Any) -> None:
        """
        Initialize AzureService with a database instance and blob service client.

        Args:
            db (Any): MongoDB database instance.
        """
        self.db = db

        if not s.AZURE_CONNECTION_STRING:
            raise ValueError("AZURE_CONNECTION_STRING is not set.")

        self.blob_service_client = BlobServiceClient.from_connection_string(
            s.AZURE_CONNECTION_STRING
        )

    def upload_content(
        self, file_path: str, title: str, description: str, tags: list[str]
    ) -> Optional[str]:
        """
        Upload content to Azure Blob Storage and save metadata to MongoDB.

        Args:
            file_path (str): The path of the file to upload.
            title (str): The title of the content.
            description (str): The description of the content.
            tags (list): The tags associated with the content.

        Returns:
            str: The unique content ID.
        """
        try:
            content_id = str(uuid.uuid4())
            file_name = os.path.basename(file_path)

            if not s.AZURE_CONTAINER_NAME:
                raise ValueError("AZURE_CONTAINER_NAME is not set.")

            blob_client = self.blob_service_client.get_blob_client(
                container=s.AZURE_CONTAINER_NAME, blob=file_name
            )

            with open(file_path, "rb") as data:
                blob_client.upload_blob(data)

            content_metadata = {
                "content_id": content_id,
                "title": title,
                "description": description,
                "tags": tags,
                "file_path": file_name,
                "blob_url": blob_client.url,
            }

            self.db.contents.insert_one(content_metadata)

            return content_id
        except Exception as e:
            logging.exception(
                f"There was a problem uploading the blob to Azure Storage Account, error: {e}"
            )
            return None

    def get_content_by_tags(self, tags: list[str]) -> Optional[str]:
        """
        Retrieve content URL by tags.

        Args:
            tags (list): List of tags to search for.

        Returns:
            str: The URL of the content if found, else None.
        """
        try:
            content = self.db.contents.find_one({"tags": {"$in": tags}})
            if content:
                return str(content["blob_url"])
            return None
        except Exception as e:
            logging.exception(f"Could not get the content from DB {e}")
            return None

    def upload_profile_image(
        self, file_stream: BinaryIO, user_id: str, original_filename: str
    ) -> Optional[str]:
        """
        Upload a profile image to Azure Blob Storage.

        Saves the image under a folder named after the user ID
        and returns the blob URL.

        Args:
            file_stream: The file stream of the image.
            user_id (str): The user's ID, used to create a folder.
            original_filename (str): The original filename to determine the file extension.

        Returns:
            str: The URL of the uploaded image.
        """
        try:
            extension = (
                original_filename.rsplit(".", 1)[1].lower() if "." in original_filename else "png"
            )
            unique_filename = f"profile_{uuid.uuid4().hex}.{extension}"
            blob_path = f"{user_id}/{unique_filename}"

            if not s.AZURE_CONTAINER_NAME:
                raise ValueError("AZURE_CONTAINER_NAME is not set.")

            blob_client = self.blob_service_client.get_blob_client(
                container=s.AZURE_PROFILE_CONTAINER_NAME, blob=blob_path
            )
            file_stream.seek(0)
            blob_client.upload_blob(file_stream, overwrite=True)
            return str(blob_client.url)
        except Exception as e:
            logging.exception("Error uploading profile image: %s", e)
            return None
