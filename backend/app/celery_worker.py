"""
Initializes Celery with the Flask application context and registers task modules.

This module sets up the Celery worker, loading the Flask app configuration and importing
all required tasks to ensure they are registered with the Celery worker.
"""

from app import create_app
from app.celery import init_celery

flask_app = create_app()
init_celery(flask_app)


# Import task modules to ensure they are registered with the Celery app
import app.tasks.notifications  # noqa: F401, E402  # type: ignore
