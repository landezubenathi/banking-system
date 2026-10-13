"""Database-backed bearer sessions and account ownership checks.

All sessions are tied to a real verified user and can be revoked on logout.
Tokens are stored as SHA-256 digests in SQL; raw bearer tokens are returned
only once, upon successful login. This is a portfolio/demo security layer,
not a substitute for a specialist security audit.
"""
import hashlib
import re
from functools import wraps
from flask import g, jsonify, request
from db import get_connection

TOKEN_PATTERN = re.compile(r"^[A-Za-z0-9_-]{40,200}$")


def token_digest(token):
    return hashlib.sha256(token.encode("ascii")).digest()


def require_auth(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        value = request.headers.get("Authorization", "")
        if not value.startswith("Bearer "):
            return jsonify({"status": "error", "message": "Login required."}), 401
        token = value[len("Bearer "):]
        if not TOKEN_PATTERN.fullmatch(token):
            return jsonify({"status": "error", "message": "Invalid session."}), 401
        conn = None
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.UserId, u.CustomerId
                FROM dbo.AuthSessions s
                JOIN dbo.Users u ON u.UserId = s.UserId
                WHERE s.TokenHash = ?
                  AND s.RevokedAt IS NULL
                  AND s.ExpiresAt > SYSUTCDATETIME()
            """, (token_digest(token),))
            row = cursor.fetchone()
        except Exception:
            # Never send SQL exceptions or secrets to the browser.
            return jsonify({"status": "error", "message": "Authentication unavailable."}), 503
        finally:
            if conn is not None:
                conn.close()
        if row is None:
            return jsonify({"status": "error", "message": "Session expired. Please log in."}), 401
        g.auth_user_id = int(row.UserId)
        g.auth_customer_id = int(row.CustomerId)
        g.auth_token_hash = token_digest(token)
        return view(*args, **kwargs)
    return wrapped


def customer_is_current(customer_id):
    try:
        return int(customer_id) == g.auth_customer_id
    except (ValueError, TypeError):
        return False


def owned_account_id(account_id):
    try:
        account_id = int(account_id)
        if account_id <= 0:
            return False
    except (ValueError, TypeError):
        return False
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT TOP 1 AccountId
            FROM dbo.Accounts
            WHERE AccountId = ? AND CustomerId = ?
        """, (account_id, g.auth_customer_id))
        return cursor.fetchone() is not None
    finally:
        conn.close()


def owned_account_number(account_number):
    if not isinstance(account_number, str) or not re.fullmatch(r"[0-9]{7,10}", account_number):
        return False
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT TOP 1 AccountId
            FROM dbo.Accounts
            WHERE AccountNumber = ? AND CustomerId = ?
        """, (account_number, g.auth_customer_id))
        return cursor.fetchone() is not None
    finally:
        conn.close()


def deny_access():
    return jsonify({"status": "error", "message": "You cannot access this account."}), 403
