from flask import Blueprint, request, jsonify
from services.auth_service import get_profile, register_user, login, update_profile

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route('/register', methods=['POST'])
def register():

    data = request.get_json()

    result = register_user(data)

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
    # LastLogin is recorded at successful login, NOT on logout.
    # This endpoint is retained for compatibility with existing clients.
    # This demo does not have server-side session/token revocation yet.
    return jsonify({"status": "success", "message": "Logged out"})


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

