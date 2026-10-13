# Reviewed source findings

The submitted repository ZIP plus the previously provided account-number update and
last-login patch were used to prepare this package. It is not a live-server audit.

## Critical findings fixed in this update
1. **Unauthenticated account access.** `GET /accounts/<customer_id>` trusted the URL.
2. **Unauthenticated transfer/deposit/withdrawal.** Routes trusted user-supplied
   `account_id` / `from_account` without server-side identity or ownership checks.
3. **Unauthenticated profile, fraud alerts and transaction history.** URL IDs were
   sufficient to read another customer's information.
4. **Account unfreezing bypass.** `POST /toggle-account-status` allowed caller to
   execute `ToggleAccountStatus`, which could undo a fraud freeze.
5. **No API session validation/revocation.** Browser `localStorage` login state is not
   proof of identity. Updated to SQL-backed expiring, revocable sessions.

## Further work
- Rate limiting for login/signup, fraud review, security headers, CSP, XSS testing,
  secure HttpOnly cookie architecture, monitoring/alerts, and privacy cleaning.
- Existing transfer trigger can flag both sender and recipient for high-value
  transfers because the procedure writes two `Transactions` rows. This is a separate
  business-rule design problem; it is not changed in this security patch.
- A `GET /` success response or login success alone does not certify security.
- This code has not been run against your live Azure SQL DB, Render service or
  the Azure Static Web Apps build. Follow the tests in SECURITY_DEPLOY_GUIDE.md.
