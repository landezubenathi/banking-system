from flask import Blueprint, jsonify
from services.fraud_services import get_fraud_alerts

fraud_bp = Blueprint("fraud_bp", __name__)

@fraud_bp.route('/fraud-alerts', methods=['GET'])
def fraud_alerts():
    return jsonify(get_fraud_alerts())

@fraud_bp.route("/fraud-alerts/<int:customer_id>", methods=["GET"])
def get_customer_alerts(customer_id):

    result = get_fraud_alerts(customer_id)

    return jsonify(result)