"""
Initialize and expose shared Flask extensions.

This module sets up `mongo` for database access and `ma` for schema serialization.
"""

from flask_marshmallow import Marshmallow
from flask_pymongo import PyMongo

import app.settings as s


mongo = PyMongo(uri=f"{s.MONGO_URI}")
ma = Marshmallow()
