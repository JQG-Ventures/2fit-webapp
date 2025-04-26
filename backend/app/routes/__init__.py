from .chat import chat_bp
from .content import azure_bp
from .users import users_bp
from .email import email_bp
from .authentication import auth_bp
from .workouts import workouts_bp
from .exercises import exercises_bp

__all__ = ['chat_bp', 'azure_bp', 'exercises_bp', 'users_bp', 'email_bp', 'auth_bp', 'workouts_bp']
