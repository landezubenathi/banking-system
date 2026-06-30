from flask import Blueprint, request, jsonify
from services.auth_service import get_profile, register_user, login, update_last_login, update_profile

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

@auth_bp.route("/logout", methods=["POST"])
def logout():
    data = request.json

    result = update_last_login(data["user_id"])

    return jsonify(result)

@auth_bp.route("/profile/<int:customer_id>", methods=["GET"])
def profile(customer_id):

    result = get_profile(customer_id)

    return jsonify(result)

@auth_bp.route("/profile", methods=["PUT"])
def update_profile_route():

    data = request.get_json()

    result = update_profile(
        data["customer_id"],
        data["full_name"],
        data["email"],
        data["phone_number"]
    )

    return jsonify(result)

