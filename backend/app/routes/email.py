from __future__ import annotations

import logging

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from flask_restx import Api, Resource
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from sqlalchemy import select

import app.settings as s
from app.extensions import db
from app.models.email import Email

logger = logging.getLogger(__name__)
email_bp = Blueprint("email_bp", __name__)
api = Api(email_bp, doc="/docs")


@api.route("/save")
class StoreEmailResource(Resource):
    @jwt_required(optional=True)
    def post(self) -> tuple[dict[str, str], int]:
        request_data = request.json
        email_address = request_data.get("to")
        email_html_content = request_data.get("html")
        email_subject = request_data.get("subject")

        if not email_address or not email_html_content:
            return {"error": "There are missing fields"}, 400

        try:
            existing = db.session.scalars(select(Email).where(Email.email == email_address)).first()

            if not existing:
                email_record = Email(email=email_address)
                db.session.add(email_record)
                db.session.commit()

                email_message = Mail(
                    from_email=s.SENDGRID_FROM_EMAIL,
                    to_emails=email_address,
                    subject=email_subject,
                    html_content=email_html_content,
                )
                sendgrid_client = SendGridAPIClient(s.SENDGRID_API_KEY)
                sendgrid_client.send(email_message)

                return {"status": "success", "message": "Email stored and sent successfully"}, 200

            return {"status": "error", "message": "Email already registered!"}, 409
        except Exception as e:
            db.session.rollback()
            logging.exception(f"Error saving email: {e}")
            return {"status": "error", "message": str(e)}, 500
