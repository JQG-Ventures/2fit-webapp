from app.extensions import mongo
from app.services.azure_service import AzureService
from flask_jwt_extended import jwt_required
from app.auth.decorators import role_required
from flask import Blueprint, request
from flask_restx import Api, Resource, fields
import logging


azure_bp = Blueprint('azure_bp', __name__)
api = Api(azure_bp, doc='/docs')
logger = logging.getLogger(__name__)

content_model = api.model('Content', {
    'file_path': fields.String(required=True, description='File path of the content to upload'),
    'title': fields.String(required=True, description='Title of the content'),
    'description': fields.String(required=True, description='Description of the content'),
    'tags': fields.String(required=True, description='Comma-separated tags for the content')
})

upload_response_model = api.model('UploadResponse', {
    'message': fields.String(description='Status message'),
    'content_id': fields.String(description='Unique identifier of the uploaded content')
})

error_model = api.model('ErrorResponse', {
    'error': fields.String(description='Error message')
})


@api.route('/content/upload')
class ContentUploadResource(Resource):
    @jwt_required()
    @role_required(['admin'])
    @api.expect(content_model)
    @api.response(201, 'Content uploaded successfully', upload_response_model)
    @api.response(400, 'Missing required fields', error_model)
    @api.response(500, 'Could not upload content', error_model)
    def post(self):
        """
        Upload content to Azure Blob Storage.
        """
        data = request.json
        file_path = data.get("file_path")
        title = data.get("title")
        description = data.get("description")
        tags = data.get("tags")

        if not file_path or not title or not description or not tags:
            return {"error": "Missing required fields"}, 400

        try:
            azure_service = AzureService(mongo.db)
            tags = tags.split(",")
            content_id = azure_service.upload_content(file_path, title, description, tags)
        except Exception as e:
            logger.exception(f"There was a problem uploading the content, error: {e}")
            return {"error": "Could not upload content"}, 500

        return {"message": "Content uploaded successfully", "content_id": content_id}, 201


@api.route('/content')
class ContentByTagsResource(Resource):
    @jwt_required()
    @role_required(['admin'])
    @api.param('tags', 'Comma-separated tags for filtering content', required=True)
    @api.response(200, 'Content URL retrieved successfully', {'content_url': fields.String})
    @api.response(400, 'Tags are required', error_model)
    @api.response(500, 'Could not retrieve content', error_model)
    def get(self):
        """
        Retrieve content URL by tags.
        """
        tags = request.args.get("tags")

        if not tags:
            return {"error": "Tags are required"}, 400

        tags_list = tags.split(",")

        try:
            azure_service = AzureService(mongo.db)
            content_url = azure_service.get_content_by_tags(tags_list)
        except Exception as e:
            logger.exception(f"There was a problem retrieving the content, error: {e}")
            return {"error": "Could not retrieve content"}, 500

        if content_url:
            return {"content_url": content_url}, 200
        else:
            return {"message": "Content not found"}, 404
