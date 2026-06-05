def validate_amount(amount):
    if amount is None:
        return "Amount is required"

    if amount <= 0:
        return "Amount must be greater than 0"

    return None


def validate_account_id(account_id):
    if not account_id:
        return "Account ID is required"

    return None