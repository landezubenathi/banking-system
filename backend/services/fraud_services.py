from db import get_connection

def get_fraud_alerts():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT FraudAlertsId,
               AccountId,
               SuspiciousAmount,
               AlertDate,
               Status
        FROM FraudAlerts
        ORDER BY AlertDate DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "alert_id": row.FraudAlertsId,
            "account_id": row.AccountId,
            "amount": float(row.SuspiciousAmount),
            "date": str(row.AlertDate),
            "status": row.Status
        }
        for row in rows
    ]