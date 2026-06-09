# 🏦 Banking System Backend Testing Guide

## Project
Banking System with Fraud Detection

---

# DATABASE TESTING (SQL SERVER)

## 1. Create Customer Profile

```sql
EXEC CreateCustomerProfile
    'Zubenathi Lande',
    'zubenathi@gmail.com',
    '0712345678',
    'landezubenathi',
    'password123';
```

Expected:

```text
Customer profile created successfully
```

---

## 2. Login User

```sql
EXEC LoginUser
    'landezubenathi',
    'password123';
```

Expected:

```text
Returns UserId, CustomerId, FullName and Username
```

---

## 3. Create Account

```sql
EXEC CreateAccount 1;
```

Expected:

```text
Account created successfully
```

---

## 4. Deposit Money

Normal Deposit:

```sql
EXEC DepositMoney 1, 500;
```

Large Deposit (Fraud Test):

```sql
EXEC DepositMoney 1, 15000;
```

Expected:

```text
Deposit successful
```

Fraud Test Expected:

```text
AccountStatus = FROZEN
FraudAlert created
```

---

## 5. Withdraw Money

Normal Withdrawal:

```sql
EXEC WithdrawMoney 1, 200;
```

Insufficient Funds Test:

```sql
EXEC WithdrawMoney 1, 999999;
```

Expected:

```text
Insufficient funds.
```

---

## 6. Transfer Money

Normal Transfer:

```sql
EXEC TransferMoney 1, 2, 300;
```

Transfer To Same Account:

```sql
EXEC TransferMoney 1, 1, 300;
```

Expected:

```text
Cannot transfer to the same account.
```

Insufficient Funds:

```sql
EXEC TransferMoney 1, 2, 999999;
```

Expected:

```text
Insufficient funds.
```

---

# DATABASE VERIFICATION QUERIES

## View Accounts

```sql
SELECT *
FROM Accounts;
```

---

## View Transactions

```sql
SELECT *
FROM Transactions
ORDER BY TransactionDate DESC;
```

---

## View Fraud Alerts

```sql
SELECT *
FROM FraudAlerts;
```

---

## Check Frozen Accounts

```sql
SELECT
    AccountId,
    AccountBalance,
    AccountStatus
FROM Accounts;
```

---

# FLASK API TESTING

Base URL

```text
http://127.0.0.1:5000
```

---

# 1. Register User

Endpoint

```http
POST /register
```

JSON Body

```json
{
    "full_name": "Zubenathi Lande",
    "email": "zubenathi@gmail.com",
    "phone_number": "0712345678",
    "username": "landezubenathi",
    "password": "password123"
}
```

Expected Response

```json
{
    "status": "success"
}
```

---

# 2. Login User

Endpoint

```http
POST /login
```

JSON Body

```json
{
    "username": "landezubenathi",
    "password": "password123"
}
```

Expected Response

```json
{
    "status": "success",
    "customer_id": 1,
    "user_id": 1,
    "username": "landezubenathi"
}
```

---

# 3. Deposit

Endpoint

```http
POST /deposit
```

JSON Body

```json
{
    "account_id": 1,
    "amount": 500
}
```

Expected Response

```json
{
    "status": "success",
    "message": "Deposit successful"
}
```

---

## Fraud Detection Test

Endpoint

```http
POST /deposit
```

JSON Body

```json
{
    "account_id": 1,
    "amount": 15000
}
```

Expected:

```text
Account Frozen
Fraud Alert Created
```

Verification Query:

```sql
SELECT * FROM FraudAlerts;
```

---

# 4. Withdraw

Endpoint

```http
POST /withdraw
```

JSON Body

```json
{
    "account_id": 1,
    "amount": 200
}
```

Expected Response

```json
{
    "status": "success",
    "message": "Withdrawal successful"
}
```

---

## Withdraw Insufficient Funds

```json
{
    "account_id": 1,
    "amount": 999999
}
```

Expected Response

```json
{
    "status": "error"
}
```

---

# 5. Transfer

Endpoint

```http
POST /transfer
```

JSON Body

```json
{
    "from_account": 1,
    "to_account": 2,
    "amount": 300
}
```

Expected Response

```json
{
    "status": "success",
    "message": "Transfer successful"
}
```

---

## Transfer To Same Account

```json
{
    "from_account": 1,
    "to_account": 1,
    "amount": 300
}
```

Expected Response

```json
{
    "status": "error"
}
```

---

## Transfer Insufficient Funds

```json
{
    "from_account": 1,
    "to_account": 2,
    "amount": 999999
}
```

Expected Response

```json
{
    "status": "error"
}
```

---

# 6. Transaction History

Endpoint

```http
GET /transactions/1
```

Expected Response

```json
{
    "status": "success",
    "transactions": [
        {
            "transaction_id": 1,
            "type": "Deposit",
            "amount": 500,
            "date": "2026-06-09",
            "reference_account": null
        }
    ]
}
```

---

# FRAUD DETECTION TEST

Trigger Rule:

```text
Amount > 10000
```

Actions:

```text
Freeze Account
Create Fraud Alert
```

Verification:

```sql
SELECT *
FROM FraudAlerts;
```

Expected:

```text
FraudAlertsId
AccountId
SuspiciousAmount
AlertDate
Status
```

---

# PROJECT STATUS

Authentication
✔ Register User
✔ Login User

Accounts
✔ Create Account

Transactions
✔ Deposit
✔ Withdraw
✔ Transfer
✔ Transaction History

Fraud Detection
✔ Trigger Created
✔ Fraud Alerts
✔ Account Freezing

Backend
✔ Flask
✔ SQL Server
✔ Stored Procedures
✔ GitHub Integration

---

# NEXT PHASE

React Frontend

Pages To Build:

1. Login Page
2. Register Page
3. Dashboard
4. Deposit Page
5. Withdraw Page
6. Transfer Page
7. Transaction History Page
8. Fraud Alert Page
9. Account Status Display

Current Status:

✅ SQL Server Complete

✅ Flask Backend Complete

🚀 Ready To Start React Frontend