# LAMA Bank — Login Works But Deposit/Transfer Ask to Sign In

## Why this happened

The existing `Deposit.jsx` checks `sessionStorage.user.customer_id` before requesting accounts. When the stored `user` object is incomplete (or leftover from a different frontend build), it displays **"Please log in again to continue"** even while `MainLayout` displays the user's `full_name`. The issue is the browser's saved profile, not necessarily the SQL authentication session.

## What this patch does

- **Flask `GET /me`** retrieves the signed-in user's identity from the existing, SQL-verified bearer session. It never accepts the customer ID from a browser parameter.
- **React session helper** obtains a fresh `customer_id` and profile from `/me`, then stores a validated profile in `sessionStorage.user`.
- **Login** waits for `/me` before redirecting to the dashboard. Incomplete login state cannot appear to succeed.
- **MainLayout** confirms/refreshes `/me` before mounting Deposit, Withdraw, Transfer, Dashboard, and other private screens. Old sessions that still have valid tokens are repaired automatically.

No SQL migrations or changes to transfer stored procedures are required.

## Install (important order)

1. Back up your working code, then copy these four paths into the corresponding locations in your existing project (do not replace whole folders):
   - `backend/routes/auth_routes.py`
   - `frontend/src/services/session.js` **(new)**
   - `frontend/src/components/MainLayout.jsx`
   - `frontend/src/pages/Login.jsx`
2. Check that your `frontend/src/services/api.js` still reads `sessionStorage.getItem('lama_token')` and attaches `Authorization: Bearer <token>` on API requests. This patch relies on the interceptor from your security update.
3. Push and deploy **Render backend first**. Confirm `GET https://lama-banking-api.onrender.com/me` (without Authorization) returns `401 Login required` rather than `404`.
4. Then deploy **Azure Static Web Apps frontend** (push the frontend files; GitHub Actions rebuilds). While Render is still deploying, the new frontend will fail the `/me` session check, so follow this order.
5. Do a hard refresh (`Ctrl+Shift+R`), sign out and log in again, then open Dashboard → Deposit → Withdraw → Transfer. Accounts should populate from your logged-in customer profile.
6. Verify with a second disposable demo user: one user's account numbers must never be returned for another user, even when a URL is altered. Try logout and expired token cases: they must be denied by Flask.

## Troubleshooting via DevTools → Network (F12)

- **POST /login 200**, **GET /me 200**, **GET /accounts/<id> 200**: session and account loading both work. If account array is empty, confirm that customer's account exists in the database.
- **GET /me 404**: backend code hasn't been deployed, or requests are going to the wrong API host.
- **GET /me 401**: missing/revoked/expired bearer token; sign in again. Do not bypass authentication.
- **GET /me 503**: temporary Render or Azure SQL connectivity problem. Check Render logs and database connectivity; don't expose credentials.
- **GET /accounts/<id> 403**: mismatch between browser customer ID and authenticated user. The `/me` refresh should prevent it.
- Don't share screenshots of Network Authorization headers or actual bearer tokens with anyone.

## Important

This patch addresses the identified missing-customer-ID symptom. If `/me` succeeds but any account endpoint still fails, record only the **endpoint name and HTTP status** (not tokens, account-holder details, or passwords) for diagnosis.
