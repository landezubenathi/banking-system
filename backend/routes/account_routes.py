from flask import Blueprint, request, jsonify
from services.account_service import create_account, get_accounts

account_bp = Blueprint("account_bp", __name__)

@account_bp.route('/create-account', methods=['POST'])
def create():
    data = request.json
    result = create_account(data['customer_id'])
    return jsonify(result)

@account_bp.route('/accounts/<int:customer_id>', methods=['GET'])
def fetch(customer_id):
    result = get_accounts(customer_id)
    return jsonify(result)