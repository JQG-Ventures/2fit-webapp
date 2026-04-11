"""
Entry point for running the Flask application.

Initializes logging and starts the app with settings defined in `app.settings`.
"""

import logging
import sys

import app.settings as s
from app import create_app

if not logging.getLogger().hasHandlers():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

app = create_app()


if __name__ == "__main__":
    app.run(debug=s.DEBUG, host=s.HOST, port=s.PORT)
