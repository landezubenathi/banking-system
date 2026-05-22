from flask import Blueprint, request, jsonify
from services.transaction_service import deposit, withdraw, transfer

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