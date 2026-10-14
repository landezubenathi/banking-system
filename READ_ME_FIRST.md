# LAMA Bank — Login session token hotfix (backend-only)

## Confirmed symptom
The browser's successful `POST /login` response has `customer_id`, `user_id`, `status: success`, but **no `token`**. The latest React login correctly refuses to proceed without a session token. The earlier *Last Login* `backend/services/auth_service.py` implementation recorded the login timestamp but did not issue the SQL-backed bearer token required by the security update.

## Minimal repair
Replace exactly **one file** in your current Git repository:

`backend/services/auth_service.py`

The supplied file is restored from the SQL-session-enabled security update. It both:
1. updates `Users.LastLogin` only after valid credentials, using UTC time; and
2. creates a cryptographically random session token, writes only its SHA-256 hash into `dbo.AuthSessions`, and returns the token in the successful `/login` JSON response.

**Do not replace any other files** for this hotfix. Do not replace the SQL database, turn off authentication, or change the React Login/Deposit/Withdraw/Transfer pages again.

## Check prerequisites
- The original security update's `backend/security.py` **must** still exist (for `token_digest`).
- `dbo.AuthSessions` must already exist in Azure SQL; you said you created it.
- The latest backend `backend/routes/auth_routes.py` must include protected `GET /me`, added by the previous session update.
- The frontend `frontend/src/services/api.js` must still attach `Authorization: Bearer <lama_token>` to its API requests.

## Deploy (backend only)
In the `banking-system` repository root:

```bash
git add backend/services/auth_service.py
git commit -m "Restore SQL-backed session token on login"
git push origin main
```

Confirm that Render is deploying the correct Git repository/branch and that the new commit appears in Render's deployment history. Wait for a successful redeploy. Do NOT push any other new frontend changes yet.

## Verify safely
1. Hard-refresh the LAMA Bank site, log in with a **fictional demo account**.
2. DevTools > Network > Fetch/XHR > select the `POST /login` response. It should have `status: "success"` and a **`token` property**. **Do not screenshot or share the actual token or the full response.**
3. An authenticated `GET /me` should return 200 with your customer details.
4. `GET /accounts/<your_customer_id>` should return 200 and the account list should load on Deposit/Withdrawal/Transfer.
5. Deposit or transfer only simulated demo money and confirm that frozen accounts still cannot send/receive restricted transactions.
6. Logout, then verify an old session is rejected (401) as in your earlier security tests.

If login now says **"Unable to log in. Please try again later"** and response status is 503, check Render logs for an Azure SQL `AuthSessions` error. Never share credentials or raw tokens. Ensure `backend/security.py` and `AuthSessions` are present, and the SQL connection user has INSERT permission on the session table.

If `POST /login` still returns no `token`, Render is likely running a different commit/branch or the replacement file wasn't deployed. Inspect the Render deployment commit before making further changes.

## Rollback
Before replacing the file, copy your current `backend/services/auth_service.py` somewhere outside the repository. If deployment unexpectedly fails, revert just this file using Git, rather than restoring unrelated older frontend files.
