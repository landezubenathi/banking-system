from db import get_connection

def deposit(account_id, amount):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("EXEC DepositMoney ?, ?", (account_id, amount))
        conn.commit()
        return {"status": "success", "message": "Deposit successful"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


def withdraw(account_id, amount):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("EXEC WithdrawMoney ?, ?", (account_id, amount))
        conn.commit()
        return {"status": "success", "message": "Withdrawal successful"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


def transfer(from_acc, to_acc, amount):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("EXEC TransferMoney ?, ?, ?", (from_acc, to_acc, amount))
        conn.commit()
        return {"status": "success", "message": "Transfer successful"}

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        conn.close()