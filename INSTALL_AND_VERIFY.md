# LAMA Bank — Coordinated Login and Account Loading Repair

This update was prepared by inspecting **banking-system-main(1).zip**, uploaded on 14 October 2026. It fixes the confirmed frontend mismatch and restores server-side ownership checks that were missing in the uploaded backend routes.

## Why login redirected back to Login

`frontend/src/pages/Login.jsx` successfully stores the bearer token under `sessionStorage.lama_token` and verifies it using `/me`. However, **`frontend/src/App.jsx` and `frontend/src/components/ProtectedRoute.jsx` were checking `localStorage.user`**, which Login deliberately deletes. Thus React redirected to Login even after `/login` returned 200 with a token and `/me` returned a valid profile.

Other pages (`Dashboard`, `Profile`, `Transactions`, `FraudAlerts`) still read `localStorage.user` too. Meanwhile, Deposit/Withdraw/Transfer repeated `/me` for every page visit. The combined effect was inconsistent authentication and disappearing account lists.

## What changed

- The route guards now check the **same sessionStorage.lama_token** that Login and the Axios interceptor use.
- MainLayout verifies the token once with authenticated `/me`, then passes the trusted profile to protected pages with React Router Outlet context.
- All protected pages now consume that verified profile, and transaction pages no longer call `/me` again on every navigation.
- Sidebar logout now imports Axios correctly, sends the bearer token to `/logout`, clears the correct session storage, and navigates to Login.
- Fraud Alerts no longer calls undefined state setters and displays the appropriate account number for each alert.
- **Security:** The uploaded ZIP contained account, transaction, and fraud routes with no `@require_auth` decorator or ownership checks. These are restored. The old account-status toggle is blocked so customers cannot unfreeze fraud-frozen accounts.

**No changes** were made to SQL tables, stored procedures, AuthSessions migration, deposit/withdraw business logic, transfer stored procedure, or password hashing.

## Installation — do this in two stages

Before replacing files, make a backup or commit of your current project. The ZIP contains **only the changed files** at the same relative paths as your project, not a full replacement of your repository.

### Stage A — Restore backend authorization on Render

1. Extract the ZIP.
2. Copy the files listed below into your local repository, replacing the matching files:

- `backend/routes/account_routes.py`
- `backend/routes/fraud_routes.py`
- `backend/routes/transaction_routes.py`

3. From the root of your repository, run:

```bash
git add backend/routes/account_routes.py backend/routes/transaction_routes.py backend/routes/fraud_routes.py
git commit -m "Restore API authentication and account ownership checks"
git push origin main
```

4. **Wait for Render to finish deploying**. Check that the backend health URL responds and that an unauthenticated request to `/accounts/14` returns 401 rather than customer data. Never send a real login token in screenshots.

### Stage B — Fix frontend session routing on Azure Static Web Apps

Copy the following files from the ZIP into the matching locations:

- `frontend/src/App.jsx`
- `frontend/src/components/MainLayout.jsx`
- `frontend/src/components/ProtectedRoute.jsx`
- `frontend/src/components/Sidebar.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Deposit.jsx`
- `frontend/src/pages/FraudAlerts.jsx`
- `frontend/src/pages/Profile.jsx`
- `frontend/src/pages/Transactions.jsx`
- `frontend/src/pages/Transfer.jsx`
- `frontend/src/pages/Withdraw.jsx`

Then run from repository root:

```bash
git add frontend/src/App.jsx frontend/src/components/ frontend/src/pages/
git commit -m "Unify session routing and account loading across banking pages"
git push origin main
```

Wait for Azure Static Web Apps deployment to finish. A Render redeploy may also run on the second push; wait for it if it does.

### Clean out only obsolete browser login state

On your banking website (not another site), open DevTools Console and run:

```javascript
sessionStorage.removeItem("lama_token");
sessionStorage.removeItem("user");
localStorage.removeItem("user");
location.reload();
```

Log in **once** and wait for the response. This does not delete your SQL customer accounts; it only clears browser-side cached login values.

## Browser tests (safe demo accounts only)

1. Login -> should navigate to Dashboard, not return to Login. Network should show `POST /login` **200**, `GET /me` **200**, and `GET /accounts/{your-own-ID}` **200**.
2. Deposit and Withdrawal -> should list your real demo account numbers. A frozen account should show the friendly frozen warning; an active account should allow a small simulated transaction.
3. Transfer -> sender list should show your own accounts; recipient is another valid demo account number; transfer should work only from your own account.
4. Transactions, Fraud Alerts, Profile -> should load your own information without JavaScript errors.
5. Logout -> should return to Login; visiting `/dashboard` should redirect to Login. Previously issued bearer token should be denied by Flask after logout.
6. With another disposable demo login, attempt to request another customer's `/accounts/{id}` and `/fraud-alerts/{id}` -> should return **403**. Direct unauthenticated API requests -> **401**.

## If it still fails, stop and collect just the status codes

- `POST /login`: status (should be 200). Confirm `token` field **exists**, but never copy its value.
- `GET /me`: status (should be 200). Tell us whether the request `Authorization` header starts with **Bearer**, without showing the token.
- `GET /accounts/<your-own-customer-id>`: status (should be 200).
- Render logs around failed requests: share sanitized error types only, never database passwords or user/session data.

**Important:** A Render 502, timeout, Azure SQL outage or an actual invalid session can still fail even with this frontend mismatch corrected. This package has not been deployed or verified against your live site.

## Offline validation performed

- React JavaScript/JSX syntax parsed successfully across all **20** source files with `@babel/parser`.
- All modified Python routes compiled successfully; 9 route handlers checked for `@require_auth` decorators.
- 13 simulated route-authorization checks passed with mocked services and ownership checks; these are **not** live end-to-end tests.
- Full production Vite build **not verified** here: the repository ZIP's Node dependencies were Windows-specific/missing the Linux Rollup native binary. Your Azure CI workflow performs its own build on the pushed commit.

## Before making the repository public

The uploaded archive includes SQL seed data and an `.env` file. Review all commits and Git history for secrets and real customer details. Do not publish real customer information or financial data. LAMA Bank is an educational simulation, not a banking product. Browser session storage remains susceptible to XSS if the site has a script injection flaw; a production service would require a deeper security review.
