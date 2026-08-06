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

def get_fraud_alerts(customer_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            FA.AlertId,
            FA.AccountId,
            FA.Amount,
            FA.AlertDate,
            FA.Status
        FROM FraudAlerts FA
        INNER JOIN Accounts A
            ON FA.AccountId = A.AccountId
        WHERE A.CustomerId = ?
        ORDER BY FA.AlertDate DESC;
    """, (customer_id,))

    alerts = []

    for row in cursor.fetchall():

        alerts.append({

            "alert_id": row.AlertId,
            "account_id": row.AccountId,
            "amount": float(row.Amount),
            "date": row.AlertDate,
            "status": row.Status

        })

    conn.close()

    return alerts