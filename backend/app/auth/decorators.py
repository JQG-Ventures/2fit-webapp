from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import mongo

import app.settings as s

def role_required(required_roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            try:
                jwt_data = get_jwt_identity()
                if not isinstance(jwt_data, str):
                    return jsonify({"status": "error", "message": "Invalid JWT data"}), 401

                user_id = jwt_data

                user = mongo.db['users'].find_one({"number": user_id})

                if user:
                    user_roles = user.get('roles', [])
                else:
                    return jsonify({"status": "error", "message": "User not found"}), 404

                if any(role in user_roles for role in required_roles):
                    return fn(*args, **kwargs)
                else:
                    return jsonify({"status": "error", "message": "Insufficient permissions"}), 403
            except Exception as e:
                return jsonify({"status": "error", "message": str(e)}), 500
        return decorated_function
    return decorator