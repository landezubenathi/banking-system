from db import get_connection

def deposit(accountId, amount):
    from utils.validators import validate_amount

    conn = None  # 👈 ADD THIS

    error = validate_amount(amount)
    if error:
        return {"status": "error", "message": error}

    try:
        conn = get_connection()
        cursor = conn.cursor()

        valid, msg = is_account_active(cursor, accountId)
        if not valid:
            return {"status": "error", "message": msg}

        cursor.execute("EXEC DepositMoney ?, ?", (accountId, amount))
        conn.commit()

        return {"status": "success", "message": "Deposit successful"}

    except Exception as e:
        print("ERROR:", e)
        return {"status": "error", "message": str(e)}

    finally:
        if conn:
            conn.close()


def withdraw(accountId, amount):
    from utils.validators import validate_amount

    conn = None  # 👈 ADD THIS

    error = validate_amount(amount)
    if error:
        return {"status": "error", "message": error}

    try:
        conn = get_connection()
        cursor = conn.cursor()

        valid, msg = is_account_active(cursor, accountId)
        if not valid:
            return {"status": "error", "message": msg}

        cursor.execute("EXEC WithdrawMoney ?, ?", (accountId, amount))
        conn.commit()
        conn.close()

        return {"status": "success", "message": "Withdrawal successful"}

    except Exception as e:
        print("ERROR:", e)
        return {"status": "error", "message": str(e)}

    finally:
        if conn:
            conn.close()


def transfer(from_acc, to_acc, amount):
    from utils.validators import validate_amount

    conn = None  # 👈 ADD THIS

    error = validate_amount(amount)
    if error:
        return {"status": "error", "message": error}

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Check sender
        valid, msg = is_account_active(cursor, from_acc)
        if not valid:
            return {"status": "error", "message": msg}

        # Check receiver
        valid, msg = is_account_active(cursor, to_acc)
        if not valid:
            return {"status": "error", "message": msg}

        cursor.execute("EXEC TransferMoney ?, ?, ?", (from_acc, to_acc, amount))
        conn.commit()
        conn.close()

        return {"status": "success", "message": "Transfer successful"}

    except Exception as e:
        print("ERROR:", e)
        return {"status": "error", "message": str(e)}

    finally:
        if conn:
            conn.close()

def is_account_active(cursor, account_id):
    cursor.execute("""
        SELECT accountStatus
        FROM Accounts
        WHERE accountId = ?
    """, (account_id,))

    result = cursor.fetchone()

    if not result:
        return False, "Account not found"

    if result.accountStatus != "ACTIVE":
        return False, "Account is frozen"

    return True, None
