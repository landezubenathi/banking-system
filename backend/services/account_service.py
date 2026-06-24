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
        SELECT AccountId, AccountBalance, AccountStatus
        FROM Accounts
        WHERE CustomerId = ?
    """, (customer_id,))

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "account_id": r.AccountId,
            "balance": r.AccountBalance,
            "status": r.AccountStatus
        }
        for r in rows
    ]