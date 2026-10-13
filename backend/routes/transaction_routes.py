from flask import Blueprint, request, jsonify, g
from services.transaction_service import deposit, get_recent_transactions, get_transactions, withdraw, transfer
from security import require_auth, owned_account_id, owned_account_number, customer_is_current, deny_access

transaction_bp = Blueprint("transaction_bp", __name__)


@transaction_bp.route('/deposit', methods=['POST'])
@require_auth
def deposit_route():
    data = request.get_json(silent=True) or {}
    if not owned_account_id(data.get('account_id')):
        return deny_access()
    result = deposit(data.get('account_id'), data.get('amount'))
    return jsonify(result), (200 if result.get('status') == 'success' else 400)


@transaction_bp.route('/withdraw', methods=['POST'])
@require_auth
def withdraw_route():
    data = request.get_json(silent=True) or {}
    if not owned_account_id(data.get('account_id')):
        return deny_access()
    result = withdraw(data.get('account_id'), data.get('amount'))
    return jsonify(result), (200 if result.get('status') == 'success' else 400)


@transaction_bp.route('/transfer', methods=['POST'])
@require_auth
def transfer_route():
    data = request.get_json(silent=True) or {}
    # Sender must belong to authenticated customer. Recipient may be another user.
    if not owned_account_number(data.get('from_account')):
        return deny_access()
    result = transfer(data.get('from_account'), data.get('to_account'), data.get('amount'))
    return jsonify(result), (200 if result.get('status') == 'success' else 400)


@transaction_bp.route('/transactions/<int:account_id>', methods=['GET'])
@require_auth
def get_transactions_route(account_id):
    if not owned_account_id(account_id):
        return deny_access()
    return jsonify(get_transactions(account_id))


@transaction_bp.route('/recent-transactions/<int:customer_id>', methods=['GET'])
@require_auth
def recent_transactions(customer_id):
    if not customer_is_current(customer_id):
        return deny_access()
    return jsonify(get_recent_transactions(g.auth_customer_id))
