from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    result = register_user(request.json)
    return jsonify(result)

@auth_bp.route('/login', methods=['POST'])
def login_route():

    data = request.get_json()

    return jsonify(
        login(
            data['username'],
            data['password']
        )
    )