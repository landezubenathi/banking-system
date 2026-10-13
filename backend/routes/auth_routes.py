import os
from flask import Blueprint, request, jsonify, g
from db import get_connection
from services.auth_service import get_profile, register_user, login, update_profile
from security import require_auth, customer_is_current, deny_access

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    if os.getenv('REGISTRATION_ENABLED', 'true').lower() != 'true':
        return jsonify({"status": "error", "message": "Public registration is disabled for this demo."}), 403
    data = request.get_json(silent=True) or {}
    required = ('full_name', 'email', 'phone', 'username', 'password')
    if any(not isinstance(data.get(k), str) or not data[k].strip() for k in required):
        return jsonify({"status": "error", "message": "Please complete all registration fields."}), 400
    if len(data['password']) < 10 or len(data['password']) > 128:
        return jsonify({"status": "error", "message": "Use a password between 10 and 128 characters."}), 400
    result = register_user(data)
    return jsonify(result), (201 if result.get('status') == 'success' else 400)


@auth_bp.route('/login', methods=['POST'])
def login_route():
    data = request.get_json(silent=True) or {}
    username, password = data.get('username'), data.get('password')
    if not isinstance(username, str) or not isinstance(password, str) or not username or not password:
        return jsonify({"status": "error", "message": "Username and password are required."}), 400
    result = login(username, password)
    if result.get('status') == 'success':
        return jsonify(result)
    return jsonify(result), (401 if 'password' in result.get('message', '').lower() else 503)


@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE dbo.AuthSessions
            SET RevokedAt = SYSUTCDATETIME()
            WHERE TokenHash = ? AND RevokedAt IS NULL
        """, (g.auth_token_hash,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"status": "success", "message": "Logged out."})


@auth_bp.route('/profile/<int:customer_id>', methods=['GET'])
@require_auth
def profile(customer_id):
    if not customer_is_current(customer_id):
        return deny_access()
    return jsonify(get_profile(g.auth_customer_id))


@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile_route():
    data = request.get_json(silent=True) or {}
    if not customer_is_current(data.get('customer_id')):
        return deny_access()
    required = ('full_name', 'email', 'phone_number')
    if any(not isinstance(data.get(k), str) or not data[k].strip() for k in required):
        return jsonify({"status": "error", "message": "Please complete all profile fields."}), 400
    if len(data['full_name']) > 100 or len(data['email']) > 100 or len(data['phone_number']) > 20:
        return jsonify({"status": "error", "message": "One or more profile fields are too long."}), 400
    return jsonify(update_profile(g.auth_customer_id, data['full_name'], data['email'], data['phone_number']))
