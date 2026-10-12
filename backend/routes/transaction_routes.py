from flask import Blueprint, request, jsonify
from services.transaction_service import (
    deposit, get_recent_transactions, get_transactions, withdraw, transfer
)

transaction_bp = Blueprint("transaction_bp", __name__)

@transaction_bp.route('/deposit', methods=['POST'])
def deposit_route():
    data = request.get_json(silent=True) or {}
    return jsonify(deposit(data.get('account_id'), data.get('amount')))

@transaction_bp.route('/withdraw', methods=['POST'])
def withdraw_route():
    data = request.get_json(silent=True) or {}
    return jsonify(withdraw(data.get('account_id'), data.get('amount')))

@transaction_bp.route('/transfer', methods=['POST'])
def transfer_route():
    data = request.get_json(silent=True) or {}
    # Keep JSON field names for backward compatibility; VALUES ARE NOW STRINGS.
    # E.g. {"from_account":"1000000006","to_account":"1000000007","amount":20}
    result = transfer(
        data.get('from_account'),
        data.get('to_account'),
        data.get('amount'),
    )
    status_code = 200 if result['status'] == 'success' else 400
    return jsonify(result), status_code

@transaction_bp.route('/transactions/<int:account_id>', methods=['GET'])
def get_transactions_route(account_id):
    return jsonify(get_transactions(account_id))

@transaction_bp.route('/recent-transactions/<int:customer_id>', methods=['GET'])
def recent_transactions(customer_id):
    return jsonify(get_recent_transactions(customer_id))
