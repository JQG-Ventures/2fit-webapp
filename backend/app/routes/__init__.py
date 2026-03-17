from .authentication import auth_bp
from .challenges import challenges_bp
from .chat import chat_bp
from .content import azure_bp
from .email import email_bp
from .exercises import exercises_bp
from .users import users_bp
from .workouts import workouts_bp

__all__ = [
    "chat_bp",
    "azure_bp",
    "exercises_bp",
    "users_bp",
    "email_bp",
    "auth_bp",
    "workouts_bp",
    "challenges_bp",
]
