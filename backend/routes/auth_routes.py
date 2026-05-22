from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login_user

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    result = register_user(request.json)
    return jsonify(result)

@auth_bp.route('/login', methods=['POST'])
def login():
    result = login_user(request.json)
    return jsonify(result)