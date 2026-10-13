# LAMA Bank – Security update deployment guide

## Why this update is needed
The previously uploaded code let browsers submit arbitrary `customer_id`, `account_id`
and `from_account`. React's `ProtectedRoute` does not protect Flask routes.
A user who knew another person's ID could reach private API endpoints.

## Included protections
- Random 48-byte-url-safe bearer tokens; **only SHA-256 hashes** are stored in Azure SQL.
- 2-hour session expiry; `/logout` revokes the active token in SQL.
- All account, transaction, profile and fraud routes check server-derived identity.
- Sender ownership is verified before a transfer (recipient can belong to a different customer).
- Self-service account-status toggle disabled: existing stored procedure can undo fraud freezes.
- React sends Authorization headers and does not rely on localStorage for proof of login.
- Login and signup input validation tightened; SQL error details removed from signup responses.
- DB connection defaults to ODBC 18, SQL authentication and Azure TLS encryption.

## Deploy in this order
1. **Back up Azure SQL and the currently deployed code.** Use demo-only customer information.
2. SQL Server Management Studio: run `database/migrations/2026_10_CreateAuthSessions.sql`
   on database `BankingSystemAndFraudDetectonDB`. Verify `dbo.AuthSessions` exists.
3. Copy the files in this ZIP into corresponding locations in your local repository,
   preserving the `backend/` and `frontend/` paths.
4. On Render, set `DB_DRIVER=ODBC Driver 18 for SQL Server`,
   `DB_TRUSTED_CONNECTION=no`, and keep the existing DB credentials.
   Optional after preparing a demo account: `REGISTRATION_ENABLED=false`.
   Make sure `FLASK_DEBUG=False` and `CORS_ORIGINS` includes the exact Azure Static Web App origin.
5. Commit and push to `main`. Render and Azure Static Web Apps both redeploy.
6. The update changes session handling: **all users must sign in again**.
   Old frontend sessions are intentionally invalidated.
7. Test authenticated reads and writes with two disposable demo users.
8. **If Render deploys but React deploy fails, login may be temporarily unusable.**
   Check both GitHub workflows before considering the update complete.

## Test matrix (use synthetic demo accounts only)
1. `POST /login`: correct password succeeds and includes a token.
2. Wrong password gives 401 and never creates a session.
3. `GET /accounts/<own_id>` without Authorization gives 401.
4. `GET /accounts/<other_id>` with user A token gives 403.
5. User A token cannot `POST /deposit` / `withdraw` on user B AccountId (403).
6. User A token cannot `POST /transfer` from user B account number (403).
7. User A token cannot read user B transactions, fraud alerts or profile (403).
8. User A can transfer to user B account number if both accounts are active.
9. `POST /logout` then reuse the same token: denied 401.
10. Dashboard, last-login, profile updates, fraud alerts still function.
11. `POST /toggle-account-status` denied 403 (fraud unfreezing disabled).
12. Refresh `/dashboard`: page loads while sessionStorage token is present.

## Security limitations still to address before unrestricted public access
- Tokens in browser sessionStorage can be stolen through XSS. A better long-term approach
  is a same-site/backend-for-frontend deployment with secure HttpOnly cookies.
- Add brute-force protection / account lockout (or edge rate limiting) for `/login` and
  throttling/captcha or disable public `/register` for controlled demonstrations.
- Add monitoring, audit logs, and proper authorization/admin review before unfreezing.
- Access to a customer's account is checked in Flask immediately before money operations;
  for higher assurance also enforce authenticated sender ownership in SQL procedures
  using an explicit verified CustomerId passed into the stored procedure.
- Review any old SQL exports for personal information and secrets before making them public.
- If backend/frontend redeploy at different times, login can fail temporarily; keep the
  demo unavailable during the cutover, and deploy both together as closely as possible.
- This is a portfolio banking *simulation*, not production banking security.
