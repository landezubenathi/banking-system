# Setup and Deployment Guide — LAMA Bank

[← Main README](../README.md) · [Architecture](ARCHITECTURE.md) · [Testing](TESTING.md)

This guide covers local development and the existing cloud architecture. LAMA Bank is a **banking simulation**. Use fictional people and simulated money only.

## Prerequisites

- Git; Python **3.12** and `pip` (matches the backend Docker image).
- Node.js + npm compatible with the `frontend/package.json` versions (React 18 / Vite 5).
- Microsoft SQL Server or Azure SQL Database, plus a SQL query tool such as **SQL Server Management Studio (SSMS)**.
- **Microsoft ODBC Driver 18 for SQL Server** installed on your local machine. Render installs it using `backend/Dockerfile`.
- Permission to create/update a **dedicated development database**; do not develop against a live demo containing other people's information.

## 1. Obtain source code

```bash
git clone https://github.com/landezubenathi/banking-system.git
cd banking-system
```

Key paths:

```text
banking-system/
├── backend/
│   ├── app.py
│   ├── db.py
│   ├── security.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── routes/
│   └── services/
├── database/
│   ├── tables/
│   ├── Procedures/
│   ├── triggers/
│   └── migrations/
├── frontend/
│   ├── public/staticwebapp.config.json
│   ├── src/
│   └── package.json
├── docs/
└── .github/workflows/
```

Some deployment/security files were added after the initial source export; verify they exist in your latest `main` branch.

## 2. Prepare the SQL database

The application's live database is named `BankingSystemAndFraudDetectonDB`. For development, use a **separate database** with the required tables and stored procedures.

### Existing database

1. Make a backup/export before changing procedures or triggers.
2. Confirm the tables `Customers`, `Users`, `Accounts`, `Transactions`, `FraudAlerts`, and `AuthSessions` are present.
3. Check `dbo.Accounts.AccountNumber` exists and is unique, and `dbo.TransferMoney` accepts `VARCHAR` account-number parameters.
4. Check the updated deposit and withdrawal procedures are installed, and the fraud trigger exists.
5. Apply **only missing, reviewed migrations**. Never rerun `CREATE TABLE` scripts against an existing database just to redeploy code.

### Fresh development database

The `database/` SQL files were developed incrementally and are **not a turnkey migration system**. Review definitions and dependencies before executing them. A sensible dependency order is:

1. Define `Customers`, `Users`, `Accounts`, `Transactions` and `FraudAlerts` with correct keys and `Accounts.AccountNumber`.
2. Create/alter stored procedures used by the application, including `CreateCustomerProfile`, `CreateAccount`, `UserLogin`, `UpdateProfile`, `DepositMoney`, `WithdrawMoney`, `TransferMoney`, `GetCustomerRecentTransactions`.
3. Apply `database/migrations/2026_10_CreateAuthSessions.sql` (server-backed sessions).
4. Create/verify `database/triggers/fraud_trigger.sql`.
5. Populate **synthetic** accounts and test data. Do **not** import historical personal data from seed files.

Some SQL files use `ALTER PROCEDURE` or may predate the account-number update; ensure your latest migrated definitions match the running API. Review scripts in SSMS before running them.

Read-only checks:

```sql
SELECT name FROM sys.tables
WHERE name IN ('Customers','Users','Accounts','Transactions','FraudAlerts','AuthSessions')
ORDER BY name;

SELECT name, type_desc FROM sys.objects
WHERE name IN ('TransferMoney','DepositMoney','WithdrawMoney','trg_FraudAlerts');

SELECT p.name, TYPE_NAME(p.user_type_id) AS data_type
FROM sys.parameters p
WHERE p.object_id = OBJECT_ID('dbo.TransferMoney');
```

The `TransferMoney` sender and recipient parameters should use a string type, not `INT`.

## 3. Configure and run Flask locally

From the repository root:

```bash
cd backend
python -m venv .venv
```

Activate it:

**Windows PowerShell**

```powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create `backend/.env` **locally** (never commit it):

```dotenv
DB_DRIVER=ODBC Driver 18 for SQL Server
DB_SERVER=your-sql-server.database.windows.net
DB_NAME=your_development_database
DB_USER=your_sql_login
DB_PASSWORD=your_secret_password
DB_TRUSTED_CONNECTION=no
CORS_ORIGINS=http://localhost:5173
FLASK_DEBUG=False
REGISTRATION_ENABLED=true
```

`REGISTRATION_ENABLED=true` is suitable only for controlled local testing. Consider `false` for a public demo after creating fictional test accounts. The database session migration must exist for login to succeed.

Start the API:

```bash
python app.py
```

Open `http://127.0.0.1:5000/`. An API health response should appear. **This root endpoint does not itself prove database connectivity**; validate a database-backed action separately using a synthetic account.

**ODBC troubleshooting:** If you see `Can't open lib 'ODBC Driver 17 for SQL Server'`, your configured `DB_DRIVER` doesn't match the installed driver. The Docker deployment uses **ODBC Driver 18**. For Azure SQL, also check the server name, credentials, encrypted connection and SQL firewall access.

## 4. Run the React frontend locally

In a **second terminal**, from the repository root:

```bash
cd frontend
npm ci
```

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://127.0.0.1:5000
```

Then:

```bash
npm run dev
```

Open `http://localhost:5173/` in your browser.

`VITE_API_URL` is a **public client-side build variable**. Never place SQL passwords, private keys, bearer tokens or other secrets in `VITE_` variables.

> Note for Windows developers: the source `package.json` previously used `chmod` in the build script as a Linux deployment workaround. That command may not work in Windows CMD/PowerShell. `npm run dev` is unaffected; test your production build in GitHub Actions/Linux or revise the script for cross-platform builds if needed.

## 5. Existing cloud deployment

### Flask API — Render

1. Open your existing Render **Web Service** connected to the GitHub repository.
2. Use the `main` branch, **Root Directory `backend`**, **Docker**, and the existing `backend/Dockerfile`.
3. Configure the backend's environment variables (`DB_DRIVER`, `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_TRUSTED_CONNECTION`, `CORS_ORIGINS`, `FLASK_DEBUG`, `REGISTRATION_ENABLED`). Set `FLASK_DEBUG=False`.
4. Ensure the Azure SQL server firewall allows Render's **actual outbound IP ranges**. Use narrow start/end IP rules; never open the database to every public IP.
5. Redeploy and inspect Render logs for Gunicorn startup and SQL connectivity errors. A free service may sleep after inactivity.

**Backend URL:** https://lama-banking-api.onrender.com/

### React — Azure Static Web Apps

The current GitHub Actions workflow uses:

| Setting | Value |
| --- | --- |
| Branch | `main` |
| App location | `/frontend` |
| API location | blank (Flask is hosted separately) |
| Output location | `dist` |
| Build-time `VITE_API_URL` | `https://lama-banking-api.onrender.com` |

`frontend/public/staticwebapp.config.json` supplies the SPA `navigationFallback` for React Router. Without it, refreshing `/login` or `/dashboard` can fail even when client-side navigation works.

**Frontend URL:** https://victorious-stone-0ee0f6c10.7.azurestaticapps.net/

After a workflow succeeds, open `/login`, sign in with a **synthetic** demo account, verify requests target the Render domain in **DevTools → Network**, and refresh `/dashboard` to confirm deep links work.

### Troubleshooting

| Symptom | Suggested check |
| --- | --- |
| `ERR_CONNECTION_REFUSED` | Inspect Network → Request URL; frontend may still point to local Flask |
| `500 Internal Server Error` | Inspect Render Python traceback and environment/ODBC configuration |
| `401 Unauthorized` | Check credentials, token expiry, and Authorization header |
| `403 Forbidden` | Check account ownership or demo registration setting |
| `400 Bad Request` for a transfer | Check sender ownership, recipient account number, account status and latest SQL procedure definition |
| SQL login/timeout error | Review Azure SQL firewall, server, DB name and credentials |
| Refreshing `/transfer` fails | Confirm `frontend/public/staticwebapp.config.json` made it into `dist` |
| Slow first load | Render free instance may be waking up |

## 6. Before making the repository public

- Search the **current files and Git history** for committed credentials, `.env` files, screenshots, SQL seed/export rows containing real identities and any tokens. Rotate any compromised credentials before publishing.
- Do not publish real customer phone numbers, emails, passwords or personal banking details. Use fictional demo records only.
- Avoid exposing real test-account passwords in the README or screenshots.
- Do not claim bank-grade security; use [TESTING.md](TESTING.md) to describe what has and has not been tested.
- Review Azure SQL and Render costs/limits. Stopping the old Azure App Service alone may not stop all App Service Plan charges.

**Contributors:** Liyabona Mafusini and Zubenathi Lande.
