from __future__ import annotations

import logging

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from flask_restx import Api, Resource

from app.auth.decorators import role_required
from app.extensions import db
from app.services.azure_service import AzureService

azure_bp = Blueprint("azure_bp", __name__)
api = Api(azure_bp, doc="/docs")
logger = logging.getLogger(__name__)


@api.route("/content/upload")
class ContentUploadResource(Resource):
    @jwt_required()
    @role_required(["admin"])
    def post(self) -> tuple[dict[str, str], int]:
        data = request.json
        if data is None:
            return {"status": "error", "message": "Missing JSON body"}, 400

        file_path = data.get("file_path")
        title = data.get("title")
        description = data.get("description")
        tags = data.get("tags")

        if not file_path or not title or not description or not tags:
            return {"error": "Missing required fields"}, 400

        try:
            azure_service = AzureService()
            tags_list = tags.split(",")
            content_id = azure_service.upload_content(file_path, title, description, tags_list)

            if content_id:
                db.session.commit()
                return {"message": "Content uploaded successfully", "content_id": content_id}, 201
            return {"message": "Cannot upload content to Azure Storage", "content_id": ""}, 400
        except Exception as e:
            db.session.rollback()
            logger.exception(f"Content upload error: {e}")
            return {"error": "Could not upload content"}, 500


@api.route("/content")
class ContentByTagsResource(Resource):
    @jwt_required()
    @role_required(["admin"])
    def get(self) -> tuple[dict[str, str], int]:
        tags = request.args.get("tags")
        if not tags:
            return {"error": "Tags are required"}, 400

        tags_list = tags.split(",")

        try:
            azure_service = AzureService()
            content_url = azure_service.get_content_by_tags(tags_list)
        except Exception as e:
            logger.exception(f"Content retrieval error: {e}")
            return {"error": "Could not retrieve content"}, 500

        if content_url:
            return {"content_url": content_url}, 200
        return {"message": "Content not found"}, 404
