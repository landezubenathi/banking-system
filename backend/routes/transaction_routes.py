from flask import Blueprint, request, jsonify
from services.transaction_service import deposit, get_recent_transactions, get_transactions, withdraw, transfer

transaction_bp = Blueprint("transaction_bp", __name__)

@transaction_bp.route('/deposit', methods=['POST'])
def deposit_route():
    data = request.json
    return jsonify(deposit(data['account_id'], data['amount']))

@transaction_bp.route('/withdraw', methods=['POST'])
def withdraw_route():
    data = request.json
    return jsonify(withdraw(data['account_id'], data['amount']))

@transaction_bp.route('/transfer', methods=['POST'])
def transfer_route():
    data = request.json
    return jsonify(transfer(
        data['from_account'],
        data['to_account'],
        data['amount']
    ))
    
@transaction_bp.route('/transactions/<int:account_id>', methods=['GET'])
def get_transactions_route(account_id):

    return jsonify(
        get_transactions(account_id)
    )

@transaction_bp.route(
    "/recent-transactions/<int:customer_id>",
    methods=["GET"]
)
def recent_transactions(customer_id):

    return jsonify(
        get_recent_transactions(customer_id)
    )