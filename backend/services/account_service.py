from db import get_connection

def create_account(customer_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("EXEC CreateAccount ?", (customer_id,))
        conn.commit()

        return {"status": "success", "message": "Account created"}

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        conn.close()


def get_accounts(customer_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT account_id, account_balance, account_status
        FROM Accounts
        WHERE customer_id = ?
    """, (customer_id,))

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "account_id": r.account_id,
            "balance": r.account_balance,
            "status": r.account_status
        }
        for r in rows
    ]