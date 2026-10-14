from flask import Blueprint, jsonify, g
from services.fraud_services import get_fraud_alerts
from security import require_auth, customer_is_current, deny_access

fraud_bp = Blueprint('fraud_bp', __name__)


@fraud_bp.route('/fraud-alerts/<int:customer_id>', methods=['GET'])
@require_auth
def get_customer_alerts(customer_id):
    if not customer_is_current(customer_id):
        return deny_access()
    return jsonify(get_fraud_alerts(g.auth_customer_id))
