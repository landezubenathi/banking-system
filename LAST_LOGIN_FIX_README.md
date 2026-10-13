# LAMA Bank — Fix Last Login

## Root cause

The original `login()` function only READ `dbo.Users.LastLogin`. Meanwhile,
`/logout` called `update_last_login(user_id)` and wrote `GETDATE()` when users
logged out. Newly registered users therefore saw `First Login` after signing in,
and dashboard timestamps became stale.

## Changes

* `backend/services/auth_service.py`: On successful password verification,
  update `Users.LastLogin` to the current UTC time, read it back, commit, and
  return it as ISO-8601 with `Z` (for correct browser timezone conversion).
  Wrong passwords never change `LastLogin`.
* `backend/routes/auth_routes.py`: Keep `/logout` for compatibility but stop
  changing `Users.LastLogin` on logout.
* `frontend/src/components/Sidebar.jsx`: Fix an existing logout bug: it
  referenced undefined `API` and `user` variables. Logout now clears the local
  demo login state without a broken API call.
* `frontend/src/pages/Dashboard.jsx`: NO CHANGE NEEDED. It already displays
  the `last_login` returned by login and saved by `Login.jsx` to localStorage:
  `new Date(user.last_login).toLocaleString()`.
* SQL migrations: NONE. `dbo.Users.LastLogin DATETIME NULL` already exists.

## Apply

1. Back up the original three files in the repository.
2. Replace them with the corresponding files from this patch.
3. Commit and push to `main`; wait for Render backend and Azure SWA frontend
   to finish deploying. Frontend change fixes the existing logout bug.
4. Log OUT then log IN again with your demo user; an existing localStorage
   value will not update until a successful new login.
5. The dashboard should now show a recent timestamp. A fresh account should
   also show a timestamp on its FIRST successful login.
6. Try a wrong password and verify it does not change `LastLogin`.

## Read-only Azure SQL verification

Run in SSMS against `BankingSystemAndFraudDetectonDB`:

```sql
SELECT TOP (20)
    Username,
    LastLogin AS LastLoginUTC
FROM dbo.Users
ORDER BY LastLogin DESC;
```

Note: timestamps are stored in UTC after this change. Historical values may
have been stored using SQL Server server-local time, depending on environment.

## Security limitation

This project currently uses `localStorage` client state, not an authenticated
server-side session. Clearing localStorage does not revoke an API credential.
Before an open public deployment, implement server-side authentication,
per-request authorization and session/token revocation; don't use real banking
accounts or real customer information in this demo.
