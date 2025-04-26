""" 
Settings file to manage the env variables or variables 
used around the solution in runtime 
"""
from dotenv import load_dotenv

import os


load_dotenv()

# OpenAI settings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL")
INTERNAL_OPENAI_MODEL = os.getenv("INTERNAL_OPENAI_MODEL")

# Mongo settings
MONGO_URI = os.getenv("MONGO_URI")

# Flask settings
DEBUG = os.getenv("DEBUG").upper() == "TRUE"
SECRET_KEY = os.getenv("SECRET_KEY")

# Azure settings
AZURE_CONNECTION_STRING = os.environ.get('AZURE_CONNECTION_STRING')
AZURE_CONTAINER_NAME = os.environ.get('AZURE_CONTAINER_NAME')
AZURE_PROFILE_CONTAINER_NAME = os.environ.get('AZURE_PROFILE_CONTAINER_NAME')

#Sendgrid settings
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")
TWILIO_VERIFICATION_URL = os.getenv("TWILIO_VERIFICATION_URL")
TWILIO_ENCRYPTED_USER = os.getenv("TWILIO_ENCRYPTED_USER")
TWILIO_ENCRYPTED_PASSWORD = os.getenv("TWILIO_ENCRYPTED_PASSWORD")

#CORS Settings
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")