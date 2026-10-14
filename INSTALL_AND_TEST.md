# LAMA Bank — Targeted 401/session-race repair

## What was confirmed
- POST /login returns HTTP 200 with a `token` field.
- GET /me returns 401 in some attempts.
- `sessionStorage.lama_token` was missing **after** those failed requests.
- The previous Axios response interceptor removed `lama_token` for every protected 401, including a delayed failure from an older request.

This explains how a token can disappear after a failed request, but it **does not prove why /me first returned 401**. The response body and exact Authorization scheme on the request remain necessary if the problem persists.

## Changes (frontend only)
1. `frontend/src/services/api.js`: attaches current Bearer token on protected requests; an older or anonymous 401 cannot clear a newer token. A 401 for the current token still invalidates it. No authentication checks bypassed.
2. `frontend/src/services/session.js`: explicitly supplies Bearer token to GET /me and ignores profiles returned for a superseded session.
3. `frontend/src/pages/Login.jsx`: prevents overlapping login attempts; only clears the attempt's token when the backend actually rejects it with 401; distinguishes failures of GET /me from failures of POST /login.

## Install
Back up your current project. Copy the three files into their corresponding `frontend/src/` paths, reviewing any newer changes first. Do **not** replace backend, database, Deposit, Withdrawal or Transfer files.

```
git add frontend/src/services/api.js frontend/src/services/session.js frontend/src/pages/Login.jsx
git commit -m "Prevent stale 401 responses from clearing active sessions"
git push origin main
```

Wait for Azure Static Web Apps deployment. Hard refresh, login once, and inspect Network. Expected chain: `POST /login 200` -> `GET /me 200` -> `GET /accounts/<id> 200` when viewing accounts.

## If GET /me still returns 401
Look at its Response and request header **without sharing secret values**.
- `Login required.` from this backend's security.py means Flask did **not** see a header beginning with `Bearer ` (even if your browser showed an Authorization field). Compare the network request, endpoint URL, and deployed Render code; inspect proxies or middleware.
- `Invalid session.` means the Bearer token format failed validation.
- `Session expired. Please log in.` means no unexpired, unrevoked matching token was found in `dbo.AuthSessions`.
- `Authentication unavailable.` with HTTP 503 points to Azure SQL connection/query trouble; inspect Render logs.

Don't paste the Authorization header value or any raw token. If the problem persists, send only `/me` status, exact short error message, and whether the Authorization value begins with **Bearer** (Yes/No).

## Security note
This improves one specific race condition. It does not weaken backend token checks or authorize transactions. A complete security review is still needed before processing anything other than fictional demo data.
