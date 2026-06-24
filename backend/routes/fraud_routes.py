from flask import Blueprint, jsonify
from services.fraud_services import get_fraud_alerts

fraud_bp = Blueprint("fraud_bp", __name__)

@fraud_bp.route('/fraud-alerts', methods=['GET'])
def fraud_alerts():
    return jsonify(get_fraud_alerts())