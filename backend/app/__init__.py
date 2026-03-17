from datetime import timedelta

from flask import Flask, Response, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

import app.settings as s
from app.extensions import db
from app.routes import (
    auth_bp,
    azure_bp,
    challenges_bp,
    chat_bp,
    email_bp,
    exercises_bp,
    users_bp,
    workouts_bp,
)


def create_app() -> Flask:
    app_instance = Flask(__name__)

    app_instance.config["SQLALCHEMY_DATABASE_URI"] = s.DATABASE_URL
    app_instance.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app_instance.config["JWT_SECRET_KEY"] = s.JWT_SECRET_KEY
    app_instance.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
    app_instance.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

    cors_origins = s.CORS_ORIGINS if s.CORS_ORIGINS else "*"
    CORS(app_instance, origins=cors_origins)
    JWTManager(app_instance)

    db.init_app(app_instance)

    app_instance.secret_key = s.SECRET_KEY
    app_instance.register_blueprint(chat_bp, url_prefix="/api")
    app_instance.register_blueprint(azure_bp, url_prefix="/api/azure")
    app_instance.register_blueprint(users_bp, url_prefix="/api/users")
    app_instance.register_blueprint(email_bp, url_prefix="/api/mail")
    app_instance.register_blueprint(auth_bp, url_prefix="/api/auth")
    app_instance.register_blueprint(workouts_bp, url_prefix="/api/workouts")
    app_instance.register_blueprint(exercises_bp, url_prefix="/api/exercises")
    app_instance.register_blueprint(challenges_bp, url_prefix="/api/challenges")

    @app_instance.route("/")
    def ping() -> tuple[Response, int]:
        return jsonify({"status": "success", "message": "pong"}), 200

    import app.models  # noqa: F401

    return app_instance
