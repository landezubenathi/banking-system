from flask import Blueprint, request, jsonify, g
from services.account_service import create_account, get_accounts
from security import require_auth, customer_is_current, deny_access

account_bp = Blueprint("account_bp", __name__)


@account_bp.route('/create-account', methods=['POST'])
@require_auth
def create():
    data = request.get_json(silent=True) or {}
    if not customer_is_current(data.get('customer_id')):
        return deny_access()
    return jsonify(create_account(g.auth_customer_id))


@account_bp.route('/accounts/<int:customer_id>', methods=['GET'])
@require_auth
def fetch(customer_id):
    if not customer_is_current(customer_id):
        return deny_access()
    return jsonify(get_accounts(g.auth_customer_id))


@account_bp.route('/toggle-account-status', methods=['POST'])
@require_auth
def toggle_status():
    # Fraud-frozen accounts must not be unfrozen through a customer UI/API.
    return jsonify({
        'status': 'error',
        'message': 'Account status changes require an authorized review.'
    }), 403
