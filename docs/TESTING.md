# Testing and Quality Assurance — LAMA Bank

[← Main README](../README.md) · [Architecture](ARCHITECTURE.md) · [Setup](SETUP.md)

## Scope

This is the project's **manual functional and targeted authorization testing plan** for the educational banking simulation. All balances and transactions are simulated. Use two or more **fictional** accounts owned by the testers. Never test against real customer data or make real financial claims.

### What has been reported so far

The developers reported **10/10 functional areas passing** and **6/6 live security checks passing** during deployment, followed by successful checks of account-number transfers, last-login timestamps, frozen-account feedback, registration navigation and React Router refresh behavior.

Those are developer-reported outcomes, **not a measured code-coverage figure, independent penetration test or certification**. Repeat relevant cases after major releases.

## Recommended test environment

- **Frontend:** https://victorious-stone-0ee0f6c10.7.azurestaticapps.net/
- **Backend:** https://lama-banking-api.onrender.com/
- **Database:** dedicated fictional test accounts in Azure SQL, or preferably a separate test database.
- **Browser tools:** Chrome/Edge DevTools → Network (request URL, HTTP status, response body) and Console.
- **Backend troubleshooting:** Render → Logs; redact any secrets, tokens and private data before sharing logs.

**Preparation:** create two disposable demo users (A and B) with distinct accounts, record starting simulated balances, ensure both are ACTIVE, and take a database backup before running destructive/fraud-trigger tests. Do not use publicly exposed test credentials.

## Functional scenarios

Mark cases complete only after personally observing the expected result on the deployment being tested.

| ID | Scenario | Expected result | Status |
| --- | --- | --- | --- |
| F01 | Login with valid credentials | Redirect to dashboard; correct account information appears | ☐ |
| F02 | Login with invalid credentials | Access denied; no user session issued | ☐ |
| F03 | Register fictional customer (if enabled) | Account/profile created; registration UI returns to login | ☐ |
| F04 | Open dashboard | Correct demo balance, account number and latest login displayed | ☐ |
| F05 | Create or view account | Public 10-digit account number shown and status identified | ☐ |
| F06 | Deposit into ACTIVE demo account | Balance increases by requested amount; history updated | ☐ |
| F07 | Withdraw within balance | Balance decreases; history updated | ☐ |
| F08 | Withdraw more than balance | Transaction rejected; balance unchanged | ☐ |
| F09 | Transfer to another valid demo account number | Sender/recipient balances update correctly; history entries appear | ☐ |
| F10 | Submit invalid account number | Appropriate validation error; no money moved | ☐ |
| F11 | Deposit/withdraw from a FROZEN account | Action blocked; full customer-facing account number in message | ☐ |
| F12 | Large suspicious transaction (in isolated test) | Fraud alert created; affected account(s) freeze per current trigger rule | ☐ |
| F13 | View fraud alerts and transaction history | Only authenticated customer's data shown | ☐ |
| F14 | Update profile | Authorized customer's changes persist | ☐ |
| F15 | Logout and log in again | New successful-login timestamp shown and old session rejected | ☐ |
| F16 | Refresh `/login`, `/dashboard`, `/transfer` directly | React routes load or redirect appropriately without static 404 | ☐ |

### Safe normal-transaction example

For a **fresh ACTIVE demo sender account** with adequate simulated funds:

1. Record the initial sender and recipient balances.
2. Deposit R100 into the sender account.
3. Withdraw R30 from the sender account.
4. Transfer R20 to the recipient's **account number** (not AccountId).
5. Confirm the sender's net change is **+R50**, the recipient's change is **+R20**, and history matches.

Avoid amounts over R10,000 in normal tests: the existing fraud rule can freeze accounts. Keep high-value fraud tests separate and record which accounts changed status.

## Authorization and session tests

| ID | Scenario | Expected result | Status |
| --- | --- | --- | --- |
| S01 | Log in using valid demo credentials | Token issued; authenticated routes succeed | ☐ |
| S02 | Incorrect password | Login rejected; no session created for this attempt | ☐ |
| S03 | Attempt to access B's account using A's valid session | API denies access (`403` or appropriate 4xx); no private data returned | ☐ |
| S04 | Attempt transfer **from** B's account using A's session | API denies transfer; no balances change | ☐ |
| S05 | Log out, then reuse the old session in a controlled test | Protected endpoint rejects the revoked token (`401`) | ☐ |
| S06 | Call formerly self-service `/toggle-account-status` | Action denied; no frozen account can be unfrozen | ☐ |
| S07 | Call protected API endpoint without bearer session | Request denied (typically `401`) | ☐ |
| S08 | Attempt negative/zero and invalidly formatted amounts | Rejected; no transaction committed | ☐ |

Only use test accounts **you own or are authorized to test**. Never put live session tokens, passwords or full request headers into bug reports or screenshots. These cases do **not** constitute a penetration test.

## Database validation (read-only queries)

In SSMS, connect to the intended test/development database and run:

```sql
SELECT TOP (10)
    AccountNumber, AccountStatus, AccountBalance
FROM dbo.Accounts
ORDER BY AccountId DESC;

SELECT TOP (10)
    TransactionId, AccountId, TransactionType, Amount, TransactionDate
FROM dbo.Transactions
ORDER BY TransactionId DESC;

SELECT TOP (10)
    FraudAlertsId, AccountId, SuspiciousAmount, AlertDate, Status
FROM dbo.FraudAlerts
ORDER BY FraudAlertsId DESC;
```

Treat account details in query results as sensitive if non-fictional data is present. Prefer a separate test database. No destructive SQL is needed for these checks.

## Issues, evidence and retesting

For each failed case, document:

```text
Test ID:
Date / environment:
Feature / account (fictional ID only):
Expected:
Actual:
HTTP status (if relevant):
Sanitized backend error / screenshot:
Fix / commit reference:
Retest result:
```

Useful failure categories:

- **Browser 404 on refresh:** check `frontend/public/staticwebapp.config.json` deployment.
- **Browser CORS failure:** check frontend origin and Flask CORS settings.
- **Network request to localhost:** verify build-time `VITE_API_URL` in GitHub Actions.
- **ODBC error 17 vs 18:** verify Render `DB_DRIVER` matches installed driver 18.
- **Transfer 400 with ten-digit number:** verify `dbo.TransferMoney` accepts `VARCHAR` and selected accounts are ACTIVE.
- **500 from Flask:** inspect sanitized Render traceback; check Azure SQL accessibility.
- **Frozen-account generic message:** verify UI uses server messages and shows `AccountNumber`, not `AccountId`.

## Release readiness and limitations

- [ ] All important functional scenarios pass against the current deployed version.
- [ ] Targeted API ownership and logout-revocation scenarios pass.
- [ ] Synthetic data only; Git files and **history** reviewed for secrets and identifying records.
- [ ] Registration policy, token storage, session expiry, CORS and TLS reviewed.
- [ ] Login rate limiting, logging redaction and abuse protections evaluated before unrestricted public traffic.
- [ ] Fraud-trigger side effects on both transfer accounts are understood/documented.
- [ ] Azure SQL billing, backups and Render free-tier wake-up time reviewed.
- [ ] Screenshots and video are safe to publish.

**Reminder:** A manually tested educational banking app is not suitable for real money or personal banking information without substantial engineering, monitoring, compliance and independent security assessment.

**Contributors:** Liyabona Mafusini and Zubenathi Lande.
