"""
Configures Celery for asynchronous task execution within a Flask application context.

Includes:
- Initialization of the Celery app with Redis as broker and backend.
- Integration with Flask app context to allow usage of app-level extensions like MongoDB.
"""

from celery import Celery

import app.settings as s


celery_app = Celery("app", broker=s.REDIS_HOST, backend=s.REDIS_HOST)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
)


def init_celery(app):
    """
    Binds the Flask application context to Celery tasks.

    This allows tasks to access Flask-specific extensions (e.g., database, config).

    Args:
        app: The Flask application instance to bind to Celery.
    """
    celery_app.conf.update(app.config)

    class ContextTask(celery_app.Task):
        """Custom Celery Task that runs within the Flask application context."""

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app.Task = ContextTask
