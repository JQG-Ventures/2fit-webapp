from __future__ import annotations
from azure.storage.blob import BlobServiceClient

import app.settings as s
import logging
import os
import uuid


logging.Logger.root.level = 10


class AzureService:
    def __init__(self, db):
        self.db = db
        self.blob_service_client = BlobServiceClient.from_connection_string(s.AZURE_CONNECTION_STRING)

    def upload_content(self, file_path: str, title: str, description: str, tags: list[str]) -> str | None:
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
            blob_client = self.blob_service_client.get_blob_client(container=s.AZURE_CONTAINER_NAME, blob=file_name)

            with open(file_path, "rb") as data:
                blob_client.upload_blob(data)

            content_metadata = {
                "content_id": content_id,
                "title": title,
                "description": description,
                "tags": tags,
                "file_path": file_name,
                "blob_url": blob_client.url
            }

            self.db.contents.insert_one(content_metadata)

            return content_id
        except Exception as e:
            logging.exception(f"There was a problem uploading the blob to Azure Storage Account, error: {e}")
            return

    def get_content_by_tags(self, tags: list[str]) -> str | None:
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
                return content["blob_url"]
        except Exception as e:
            logging.exception(f"Could not get the content from DB {e}")
            return None

    def upload_profile_image(self, file_stream, user_id: str, original_filename: str) -> str | None:
        """
        Upload a profile image to Azure Blob Storage, saving it under a folder named after the user_id,
        and return the blob URL.

        Args:
            file_stream: The file stream of the image.
            user_id (str): The user's ID, used to create a folder.
            original_filename (str): The original filename to determine the file extension.

        Returns:
            str: The URL of the uploaded image.
        """
        try:
            extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'png'
            # Generate a unique filename without user_id since the folder will be the user_id
            unique_filename = f"profile_{uuid.uuid4().hex}.{extension}"
            # Include the user_id as a folder in the blob path
            blob_path = f"{user_id}/{unique_filename}"
            blob_client = self.blob_service_client.get_blob_client(container=s.AZURE_PROFILE_CONTAINER_NAME, blob=blob_path)
            file_stream.seek(0)
            blob_client.upload_blob(file_stream, overwrite=True)
            return blob_client.url
        except Exception as e:
            logging.exception("Error uploading profile image: %s", e)
            return None