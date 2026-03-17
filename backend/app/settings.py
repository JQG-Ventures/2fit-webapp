"""
Settings file to manage environment variables.

Used to configure environment-dependent values for runtime such as API keys,
database URIs, and external service integrations (OpenAI, Azure, etc.).
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _get_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


# OpenAI settings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "")
INTERNAL_OPENAI_MODEL = os.getenv("INTERNAL_OPENAI_MODEL", "")

# Database settings
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/twofit")

# Flask settings
DEBUG = os.getenv("DEBUG", "TRUE").upper() == "TRUE"
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))
SECRET_KEY = os.getenv("SECRET_KEY", "")

# Azure settings
AZURE_CONNECTION_STRING = os.environ.get("AZURE_CONNECTION_STRING", "")
AZURE_CONTAINER_NAME = os.environ.get("AZURE_CONTAINER_NAME", "")
AZURE_PROFILE_CONTAINER_NAME = os.environ.get("AZURE_PROFILE_CONTAINER_NAME", "")

# Sendgrid settings
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "")
TWILIO_VERIFICATION_URL = os.getenv("TWILIO_VERIFICATION_URL", "")
TWILIO_ENCRYPTED_USER = os.getenv("TWILIO_ENCRYPTED_USER", "")
TWILIO_ENCRYPTED_PASSWORD = os.getenv("TWILIO_ENCRYPTED_PASSWORD", "")
TWILIO_SERVICE_SID = os.getenv("TWILIO_SERVICE_SID", "")

# CORS Settings
CORS_ORIGINS = _get_cors_origins()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

REDIS_URL = os.getenv("REDIS_URL", os.getenv("REDIS_HOST", "redis://localhost:6379/0"))

ONESIGNAL_APP_ID = os.getenv("ONESIGNAL_APP_ID", "")
ONESIGNAL_REST_API_KEY = os.getenv("ONESIGNAL_REST_API_KEY", "")
