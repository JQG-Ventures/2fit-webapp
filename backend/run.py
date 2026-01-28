"""
Entry point for running the Flask application.

Initializes logging and starts the app with settings defined in `app.settings`.
"""

import warnings
warnings.filterwarnings("ignore", module="urllib3")
warnings.filterwarnings("ignore", message=".*marshmallow_dataclass.*ObjectId.*")

from app import create_app

import app.settings as s
import logging
import sys


if not logging.getLogger().hasHandlers():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

app = create_app()


if __name__ == "__main__":
    app.run(debug=s.DEBUG, port=5001)
