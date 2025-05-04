"""Defines email API endpoints for users."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from flask_restx import Api, Resource, fields
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.extensions import mongo

import app.settings as s
import logging


logger = logging.getLogger(__name__)
email_bp = Blueprint("email_bp", __name__)
api = Api(email_bp, doc="/docs")


email_model = api.model(
    "Email",
    {
        "to": fields.String(
            required=True,
            description="Recipient email address",
            example="user@example.com",
        ),
        "subject": fields.String(description="Subject of the email"),
        "html": fields.String(required=True, description="HTML content of the email"),
    },
)

success_response_model = api.model(
    "SuccessResponse",
    {
        "status": fields.String(description="Status message", example="success"),
        "message": fields.String(
            description="Response message",
            example="Email stored and sent successfully",
        ),
    },
)

error_response_model = api.model(
    "ErrorResponse",
    {"error": fields.String(description="Error message", example="There are missing fields")},
)

conflict_response_model = api.model(
    "ConflictResponse",
    {
        "status": fields.String(description="Status message", example="error"),
        "message": fields.String(
            description="Conflict message", example="Email already registered"
        ),
    },
)


@api.route("/save")
class StoreEmailResource(Resource):
    """Save email for user."""

    @jwt_required(optional=True)
    @api.expect(email_model)
    @api.response(200, "Email stored and sent successfully", success_response_model)
    @api.response(400, "There are missing fields", error_response_model)
    @api.response(409, "Email already registered", conflict_response_model)
    @api.response(500, "Internal server error", error_response_model)
    def post(self):
        """Store and send an email notification."""
        request_data = request.json
        email_address = request_data.get("to")
        email_subject = request_data.get("subject")
        email_html_content = request_data.get("html")

        if not email_address or not email_html_content:
            return {"error": "There are missing fields"}, 400

        try:
            if not mongo.db.emails.find_one({"email": email_address}):
                insertion_result = mongo.db.emails.insert_one({"email": email_address})
                inserted_id = insertion_result.inserted_id
                logging.info(f"Email {email_address} saved with ID {inserted_id}!")

                email_message = Mail(
                    from_email=s.SENDGRID_FROM_EMAIL,
                    to_emails=email_address,
                    subject=email_subject,
                    html_content=email_html_content,
                )
                sendgrid_client = SendGridAPIClient(s.SENDGRID_API_KEY)
                sendgrid_client.send(email_message)

                logging.info(f"Email {email_address} was notified about registration!")
                return {
                    "status": "success",
                    "message": "Email stored and sent successfully",
                }, 200

            logging.info(f"Email {email_address} already registered!")
            return {
                "status": "error",
                "message": "Email already registered!",
            }, 409
        except Exception as e:
            logging.exception(f"There was an error saving the email | error: {e}")
            return {"status": "error", "message": str(e)}, 500
