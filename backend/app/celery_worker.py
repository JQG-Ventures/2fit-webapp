from app.celery import init_celery
from app import create_app


flask_app = create_app()
init_celery(flask_app)


import app.tasks.notifications  # noqa: F401, E402  # type: ignore
