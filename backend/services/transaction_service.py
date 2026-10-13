import logging
import re
from decimal import Decimal, InvalidOperation

from db import get_connection

logger = logging.getLogger(__name__)
ACCOUNT_NUMBER_PATTERN = re.compile(r"^[0-9]{7,10}$")

def _business_error(error_code, message):
    return {"status": "error", "code": error_code, "message": message}


def _validate_transaction_amount(amount):
    """Validate money values without silently rounding down fractional cents."""
    try:
        value = Decimal(str(amount))
    except (InvalidOperation, TypeError, ValueError):
        return None, _business_error("INVALID_AMOUNT", "Please enter a valid amount.")

    if (not value.is_finite() or value <= 0 or
            value.as_tuple().exponent < -2 or
            value > Decimal("9999999999999999.99")):
        return None, _business_error(
            "INVALID_AMOUNT", "Enter an amount greater than R0.00 with at most two decimal places."
        )
    return value, None


def _account_status_error(cursor, account_id, operation):
    """Only called after authenticated route has checked account ownership.

    Use public AccountNumber, never the internal AccountId, in customer messages.
    Lock the row within the current transaction to prevent a concurrent freeze.
    """
    cursor.execute("""
        SELECT AccountNumber, AccountStatus
        FROM dbo.Accounts WITH (UPDLOCK, HOLDLOCK)
        WHERE AccountId = ?
    """, (account_id,))
    row = cursor.fetchone()
    if row is None:
        return _business_error("ACCOUNT_NOT_FOUND", "We couldn't find that account. Refresh and try again.")

    number = str(row.AccountNumber) if row.AccountNumber is not None else "the selected account"
    status = str(row.AccountStatus or "").upper()
    if status == "FROZEN":
        return _business_error(
            "ACCOUNT_FROZEN",
            f"Account {number} is frozen. You can't {operation} money until the account has been reviewed."
        )
    if status != "ACTIVE":
        return _business_error(
            "ACCOUNT_UNAVAILABLE",
            f"Account {number} is currently unavailable for {'deposits' if operation == 'deposit' else 'withdrawals'}. Please contact support."
        )
    return None


def _run_account_transaction(operation, account_id, amount):
    amount_value, error = _validate_transaction_amount(amount)
    if error:
        return error

    procedure = "dbo.DepositMoney" if operation == "deposit" else "dbo.WithdrawMoney"
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        account_error = _account_status_error(cursor, account_id, operation)
        if account_error:
            conn.rollback()  # release SQL locks held during status check
            return account_error

        cursor.execute(f"EXEC {procedure} ?, ?", (account_id, amount_value))
        conn.commit()
        action = "Deposit" if operation == "deposit" else "Withdrawal"
        return {"status": "success", "message": f"{action} successful."}
    except Exception as exc:
        if conn is not None:
            conn.rollback()
        logger.exception("%s failed", operation.capitalize())
        raw = str(exc)
        # SQL can reject a request if the account changed status during execution.
        if "Account is frozen." in raw:
            public_number = "the selected account"
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT AccountNumber FROM dbo.Accounts WHERE AccountId = ?", (account_id,))
                row = cursor.fetchone()
                if row and row.AccountNumber is not None:
                    public_number = str(row.AccountNumber)
            except Exception:
                logger.warning("Could not resolve account number for transaction error", exc_info=True)
            return _business_error("ACCOUNT_FROZEN", f"Account {public_number} is frozen. Transactions are unavailable until it has been reviewed.")
        if "Insufficient funds." in raw:
            return _business_error("INSUFFICIENT_FUNDS", "Your account doesn't have enough funds for this withdrawal.")
        if "Account not found." in raw:
            return _business_error("ACCOUNT_NOT_FOUND", "We couldn't find that account. Refresh and try again.")
        return _business_error(
            "TRANSACTION_FAILED", f"We couldn't complete your {operation} right now. Please try again later."
        )
    finally:
        if conn is not None:
            conn.close()


def deposit(accountId, amount):
    return _run_account_transaction("deposit", accountId, amount)


def withdraw(accountId, amount):
    return _run_account_transaction("withdraw", accountId, amount)


def transfer(from_account_number, to_account_number, amount):
    """Both account parameters are CUSTOMER-FACING NUMBER STRINGS, not IDs.

    Route-level authorization verifies sender ownership before this is called.
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
        if message == "Sender account is not active.":
            message = f"Account {from_account_number} is frozen or inactive. You can't transfer money from it until it has been reviewed."
        elif message == "Recipient account is not active.":
            message = "The recipient account is currently unavailable. Please check the details or contact support."
        elif message == "Insufficient funds.":
            message = "Your account doesn't have enough funds for this transfer."
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