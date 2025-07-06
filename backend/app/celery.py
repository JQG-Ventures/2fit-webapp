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
    Binds Flask app context to Celery so extensions like mongo can be used.
    """
    celery_app.conf.update(app.config)

    class ContextTask(celery_app.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app.Task = ContextTask
