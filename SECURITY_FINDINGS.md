# LAMA Bank — security findings from reviewed repository ZIP

**Important:** These are concrete findings in the supplied source, not claims that the hosted deployment was independently penetration-tested.

The React login uses `localStorage.setItem("user", JSON.stringify(response.data))` and the route guard only checks that localStorage key. The Flask login returns user identity fields but **no signed token or server-side session cookie**. Flask transaction/account/profile/fraud routes do not authenticate the caller or independently enforce ownership.

Examples from the original repository:

- `backend/routes/transaction_routes.py`: `/transfer`, `/deposit`, `/withdraw` accept sender/account fields directly from an unauthenticated request.
- `backend/routes/account_routes.py`: `/accounts/<customer_id>` returns records based on a caller-controlled URL; `/toggle-account-status` accepts caller-controlled `account_id`.
- `backend/routes/auth_routes.py`: `/profile/<customer_id>` and `PUT /profile` trust caller-supplied customer IDs.
- `backend/routes/fraud_routes.py`: `/fraud-alerts/<customer_id>` trusts a caller-supplied customer ID.
- `frontend/src/components/ProtectedRoute.jsx`: localStorage UI guard only; it does not protect the backend.
- `frontend/src/components/Sidebar.jsx`: logout attempts to use undefined `API` and `user` variables, catches the error, and clears localStorage; it does not establish server-side logout security.

### Severity: critical before public demonstration

Although the owner previously reported passing a 10/10 manual feature/security checklist, the source code in this ZIP **does not substantiate the server-side authorization portion**. A user who can send HTTP requests could potentially operate on IDs belonging to other users. **Changing to account numbers does not fix this.**

**Required before broad public access:**

1. Implement signed, expiring server-side sessions or a properly validated token approach (with secure secret rotation and credential storage).
2. Enforce an authenticated customer identity for every private or money-moving route.
3. Verify that the sending account belongs to that authenticated customer at the backend/SQL boundary; never trust `from_account` or `customer_id` just because React provided it.
4. Apply equivalent ownership checks to account data, deposit, withdrawal, profile, transactions, account status changes and fraud alerts.
5. Review access to account-freeze/unfreeze, login attempts, password policies, rate limits and logout/token invalidation.
6. Replace any production data with synthetic demo profiles before showcasing it.
7. Keep secrets out of committed files and Rotate credentials if they were ever exposed; check the repository and its Git history.

This transfer-change package intentionally does **not** invent a half-implemented authentication system. It keeps the change narrowly scoped so it can be reviewed and tested, but it must not be confused with a security remediation.
