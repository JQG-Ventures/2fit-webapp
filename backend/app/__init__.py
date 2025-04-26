from app.extensions import mongo, ma
from app.routes import chat_bp, azure_bp, users_bp, email_bp, auth_bp, workouts_bp, exercises_bp
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

import app.settings as s


def create_app() -> Flask:
    """
    Creates the Flask instance to execute in runtime

    Returns:
        Flask: Flask instance for runtime
    """
    app_instance = Flask(__name__)

    app_instance.config["MONGO_URI"] = f"{s.MONGO_URI}"
    app_instance.config['JWT_SECRET_KEY'] = s.JWT_SECRET_KEY
    app_instance.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
    app_instance.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

    CORS(app_instance)
    JWTManager(app_instance)

    mongo.init_app(app_instance)
    ma.init_app(app_instance)

    app_instance.secret_key = s.SECRET_KEY
    app_instance.register_blueprint(chat_bp, url_prefix="/api")
    app_instance.register_blueprint(azure_bp, url_prefix="/api/azure")
    app_instance.register_blueprint(users_bp, url_prefix="/api/users")
    app_instance.register_blueprint(email_bp, url_prefix="/api/mail")
    app_instance.register_blueprint(auth_bp, url_prefix="/api/auth")
    app_instance.register_blueprint(workouts_bp, url_prefix="/api/workouts")
    app_instance.register_blueprint(exercises_bp, url_prefix="/api/exercises")

    @app_instance.route('/')
    def ping():
        return jsonify({"status": "success", "message": "pong"}), 200

    with app_instance.app_context():
        try:
            mongo.db.command("ping")
            print("MongoDB connected successfully.")
        except Exception as e:
            print(f"MongoDB connection failed: {e}")

    return app_instance
