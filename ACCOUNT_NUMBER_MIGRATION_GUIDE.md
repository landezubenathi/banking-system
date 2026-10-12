# LAMA Bank — Account-number transfer migration and QA

## Reviewed changes

| File | Change |
| --- | --- |
| `database/Procedures/TransferMoney.sql` | `CREATE OR ALTER` procedure; 7–10 digit account numbers resolved to internal IDs; atomic updates and checks |
| `database/tables/Accounts.sql` | Adds `AccountNumber VARCHAR(10)` and unique constraint for clean schema reference (DO NOT run against existing DB) |
| `backend/services/transaction_service.py` | Pass number strings to procedure and return validated transfer responses; history maps related ID to AccountNumber |
| `backend/routes/transaction_routes.py` | Preserve `from_account` / `to_account` JSON field names but accept string values; invalid transfer HTTP 400 |
| `frontend/src/pages/Transfer.jsx` | Use account numbers in dropdown and input; no `Number(...)` conversion of account numbers |
| `frontend/src/pages/Transactions.jsx` | Show related account number for transfer history |
| `README.md` | Actual-stack README and documented limitations |

**No change required to:** `DepositMoney.sql`, `WithdrawMoney.sql`, or `triggers/fraud_trigger.sql`. These correctly use internal IDs for FK references. Other screens still use AccountIds internally and do not need to be migrated for this change.

## IMPORTANT — release sequencing

The old transfer API sends numeric internal IDs. The new transfer procedure requires account-number strings. The changes are **not backward-compatible**, so create a maintenance window for the transfer feature and deploy them together:

1. Make a backup/export of the Azure SQL database and export the old `TransferMoney` stored procedure definition.
2. **Restrict public/demo access** while updating. The ZIP currently has no server-side authentication/ownership enforcement. See `SECURITY_FINDINGS.md`.
3. Run `database/Procedures/TransferMoney.sql` in SSMS **with the correct database selected**. Do not run `tables/Accounts.sql` on the live database.
4. Copy the updated backend files and push to GitHub; wait for Render's deploy to finish.
5. Copy the updated frontend files and push; wait for Azure Static Web Apps GitHub Actions to finish.
6. Reload the website without cache, then test with *synthetic demo accounts*, not actual financial data.
7. Check Render logs and Azure SQL transaction history. Make sure normal transfers, failures and fraud alerts work as expected.
8. Only re-open any intended test access after a server-side authorization layer and privacy review are complete.

**Note:** If any old app instances remain live during the update, transfers may fail until all three parts match. Keep the transfer UI unavailable during the release or migrate through a separately named procedure as a two-phase deployment.

## Example payload

```json
{
  "from_account": "1000000006",
  "to_account": "1000000007",
  "amount": 20.00
}
```

These are **illustrative account numbers**, not a recommendation to transact against those specific records.

## Recommended tests

| Case | Expected |
| --- | --- |
| Active demo sender + active demo recipient + sufficient balance | Success; sender decreases, recipient increases by same amount |
| Unknown 10-digit recipient | Rejected; balances unchanged |
| Recipient entered as a 1-digit AccountId | Rejected; only 7–10 digit AccountNumber accepted |
| Sender equals recipient | Rejected |
| Insufficient balance | Rejected; no transaction rows written |
| Frozen sender or recipient | Rejected |
| Account number begins with `0` | Preserved as a string if a matching account exists |
| >10-digit account number | Rejected (schema supports 10 max) |
| Non-digit account number | Rejected |
| Over R10,000 transaction | Triggers fraud rule; account(s) frozen per existing trigger behavior |
| Transaction history after transfer | Related account number displayed, internal FK records remain valid |

## Useful read-only SQL verification

```sql
SELECT TOP (20)
    AccountId, AccountNumber, AccountStatus, AccountBalance
FROM dbo.Accounts
ORDER BY AccountId;

SELECT TOP (20)
    t.TransactionId, t.AccountId, a.AccountNumber,
    t.ReferenceAccountId, related.AccountNumber AS RelatedAccountNumber,
    t.TransactionType, t.Amount, t.TransactionDate
FROM dbo.Transactions t
JOIN dbo.Accounts a ON a.AccountId = t.AccountId
LEFT JOIN dbo.Accounts related ON related.AccountId = t.ReferenceAccountId
ORDER BY t.TransactionId DESC;
```

## Unit tests

```bash
python -m unittest discover -s backend/tests -p 'test_*.py'
```

These tests use mocked SQL connections. A successful unit test does **not** mean the Azure SQL stored procedure or deployed apps have been tested.

## Rollback

- Revert the frontend/backend commits together and redeploy.
- Restore the previous procedure definition from the backup taken in step 1.
- Do not drop account-number columns or delete historical transaction rows; this migration does not rewrite existing transaction data.
