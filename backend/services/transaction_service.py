import logging
import re
from decimal import Decimal, InvalidOperation

from db import get_connection

logger = logging.getLogger(__name__)
ACCOUNT_NUMBER_PATTERN = re.compile(r"^[0-9]{7,10}$")

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
        #conn.close()

        return {"status": "success", "message": "Withdrawal successful"}

    except Exception as e:
        print("ERROR:", e)
        return {"status": "error", "message": str(e)}

    finally:
        if conn:
            conn.close()


def transfer(from_account_number, to_account_number, amount):
    """Both account parameters are CUSTOMER-FACING NUMBER STRINGS, not IDs.

    SECURITY: This implementation validates input but DOES NOT authenticate the
    caller or verify sender ownership. The current repository has no server-side
    auth layer. See SECURITY_FINDINGS.md before exposing this route publicly.
    """
    if (not isinstance(from_account_number, str) or
            not ACCOUNT_NUMBER_PATTERN.fullmatch(from_account_number)):
        return {"status": "error", "message": "Sender account number must be 7 to 10 digits."}

    if (not isinstance(to_account_number, str) or
            not ACCOUNT_NUMBER_PATTERN.fullmatch(to_account_number)):
        return {"status": "error", "message": "Recipient account number must be 7 to 10 digits."}

    if from_account_number == to_account_number:
        return {"status": "error", "message": "Cannot transfer to the same account."}

    try:
        numeric_amount = Decimal(str(amount))
    except (InvalidOperation, TypeError, ValueError):
        return {"status": "error", "message": "Enter a valid transfer amount."}

    if (not numeric_amount.is_finite() or numeric_amount <= 0 or
            numeric_amount.as_tuple().exponent < -2 or
            numeric_amount >= Decimal("10000000000000000")):
        return {"status": "error", "message": "Amount must be positive with at most 2 decimal places."}

    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # SQL resolves AccountNumber -> AccountId and runs a single atomic transfer.
        cursor.execute(
            "EXEC dbo.TransferMoney @FromAccount=?, @ToAccount=?, @Amount=?",
            (from_account_number, to_account_number, numeric_amount),
        )
        conn.commit()
        return {"status": "success", "message": "Transfer successful"}
    except Exception as exc:
        if conn:
            conn.rollback()
        logger.exception("Account-number transfer failed")
        # Surface only known, non-sensitive business validation messages.
        known_messages = (
            "Sender account number not found.",
            "Recipient account number not found.",
            "Sender account is not active.",
            "Recipient account is not active.",
            "Insufficient funds.",
            "Cannot transfer to the same account.",
        )
        raw_message = str(exc)
        message = next((msg for msg in known_messages if msg in raw_message),
                       "Transfer could not be completed. Please try again.")
        return {"status": "error", "message": message}
    finally:
        if conn:
            conn.close()



def get_transactions(account_id):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                t.TransactionId,
                t.TransactionType,
                t.Amount,
                t.TransactionDate,
                t.ReferenceAccountId,
                related.AccountNumber AS ReferenceAccountNumber
            FROM dbo.Transactions AS t
            LEFT JOIN dbo.Accounts AS related
                ON t.ReferenceAccountId = related.AccountId
            WHERE t.AccountId = ?
            ORDER BY t.TransactionDate DESC, t.TransactionId DESC
        """, (account_id,))

        rows = cursor.fetchall()
        return {
            "status": "success",
            "transactions": [{
                "transaction_id": row.TransactionId,
                "type": row.TransactionType,
                "amount": float(row.Amount),
                "date": str(row.TransactionDate),
                "reference_account": row.ReferenceAccountId,
                "reference_account_number": row.ReferenceAccountNumber,
            } for row in rows]
        }
    except Exception:
        logger.exception("Loading transaction history failed")
        return {"status": "error", "message": "Unable to load transaction history."}
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
        return False, f"Account {account_id} not found"

    if result.accountStatus != "ACTIVE":
        return False, f"Account {account_id} is frozen"

    return True, None

def get_recent_transactions(customer_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "EXEC GetCustomerRecentTransactions ?",
        (customer_id,)
    )

    rows = cursor.fetchall()

    conn.close()

    transactions = []

    for row in rows:
        transactions.append({
            "transaction_id": row.TransactionId,
            "account_id": row.AccountId,
            "type": row.TransactionType,
            "amount": float(row.Amount),
            "date": str(row.TransactionDate)
        })

    return transactions