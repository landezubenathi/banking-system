# 🏦 Banking System with Fraud Detection

A full-stack banking simulation system built using **React, Flask, and Microsoft SQL Server**, featuring customer registration, authentication, account management, deposits, withdrawals, transfers, transaction history, and automated fraud detection.

The project demonstrates **full-stack development, REST API integration, relational database design, stored procedures, database triggers, password hashing, and automated business logic**.

---

## 📌 Project Overview

The Banking System simulates core banking operations through a web-based application.

Users can:

- Register a customer profile
- Automatically receive a bank account after registration
- Log in securely using a username and password
- View their account information
- Deposit money
- Withdraw money
- Transfer money between accounts
- View transaction history
- View recent account activity
- View fraud alerts associated with their account
- Freeze and unfreeze their account

The system uses **SQL Server stored procedures and triggers** to handle important banking operations and fraud detection.

---

## 🎯 Key Objectives

- Develop a functional full-stack banking application
- Implement a REST API using Flask
- Build a responsive frontend using React
- Design and manage a relational SQL Server database
- Use stored procedures for banking operations
- Implement automated fraud detection using SQL Server triggers
- Implement password hashing for user authentication
- Demonstrate database-driven business logic
- Implement protected application routes

---

# 🛠️ Technology Stack

## Frontend

- React.js
- JavaScript (ES6+)
- Axios
- React Router
- CSS

## Backend

- Python
- Flask
- Flask-CORS
- PyODBC
- Werkzeug Security

## Database

- Microsoft SQL Server
- T-SQL
- Stored Procedures
- Database Triggers
- Relational Database Design

---

# 🏗️ System Architecture

```text
React Frontend
       ↓
Axios HTTP Requests
       ↓
Flask REST API
       ↓
Service Layer
       ↓
PyODBC
       ↓
Microsoft SQL Server
       ↓
Stored Procedures / Triggers
🔄 System Workflow
User Action
     ↓
React Frontend
     ↓
Flask API Request
     ↓
Backend Service
     ↓
SQL Server Stored Procedure
     ↓
Database Transaction
     ↓
Fraud Detection Trigger
     ↓
Account / Fraud Alert Updated
     ↓
JSON Response
     ↓
React UI
🗄️ Database Design

The system uses several core tables.

Customers

Stores customer profile information.

CustomerId
FullName
Email
PhoneNumber
Users

Stores authentication information.

UserId
CustomerId
Username
PasswordHash
LastLogin
Accounts

Stores bank account information.

AccountId
AccountNumber
CustomerId
AccountBalance
AccountStatus
DateCreated
Transactions

Stores financial transaction records.

TransactionId
AccountId
TransactionType
Amount
TransactionDate
ReferenceAccountId
FraudAlerts

Stores suspicious transaction records.

FraudAlertsId
AccountId
SuspiciousAmount
AlertDate
Status
⚙️ Database Features
Stored Procedures

The system uses SQL Server stored procedures for major operations.

Examples include:

CreateCustomerProfile
CreateAccount
UserLogin
DepositMoney
WithdrawMoney
TransferMoney
ToggleAccountStatus
UpdateProfile
GetCustomerRecentTransactions
👤 Customer Registration

When a new user registers:

Registration Form
       ↓
Flask /register
       ↓
CreateCustomerProfile
       ↓
Customer Created
       ↓
User Created
       ↓
CreateAccount
       ↓
Bank Account Created

The system automatically creates a bank account for the newly registered customer.

The account receives a 10-digit account number.

🔐 Authentication

The application uses username and password authentication.

Passwords are stored using password hashing rather than plain text.

The login process:

Username + Password
        ↓
Flask API
        ↓
UserLogin
        ↓
Retrieve Password Hash
        ↓
Verify Password
        ↓
Successful Authentication
        ↓
User Information Returned

The frontend stores the authenticated user's session information in localStorage.

💳 Banking Operations
Deposit

Users can deposit funds into their active bank account.

POST /deposit
Withdrawal

Users can withdraw funds from their account.

POST /withdraw

The system validates:

Account existence
Account status
Transaction amount
Available balance
Transfer

Users can transfer funds between accounts.

POST /transfer

The system validates both the sender and receiver accounts before processing the transaction.

🚨 Automated Fraud Detection

The system implements automated fraud detection using a SQL Server AFTER INSERT trigger.

Fraud Rule
Transaction Amount > R10,000

When a suspicious transaction is detected, the database automatically:

Creates a fraud alert
Records the suspicious amount
Records the affected account
Freezes the account
Transaction
     ↓
Amount > R10,000
     ↓
Fraud Detection Trigger
     ↓
Create Fraud Alert
     ↓
Freeze Account

The fraud detection logic is implemented at the database level, reducing dependency on frontend or backend logic.

📡 Backend API

The Flask backend exposes REST API endpoints for communication with the React frontend.

Authentication
POST /register
POST /login
POST /logout
GET  /profile/<customer_id>
PUT  /profile
Accounts
POST /create-account
GET  /accounts/<customer_id>
POST /toggle-account-status
Transactions
POST /deposit
POST /withdraw
POST /transfer
GET  /transactions/<account_id>
GET  /recent-transactions/<customer_id>
Fraud Detection
GET /fraud-alerts/<customer_id>
💻 Frontend

The React application contains the following main pages:

Login
Registration
Dashboard
Profile
Deposit
Withdraw
Transfer
Transactions
Fraud Alerts
📊 Dashboard

The dashboard provides an overview of the customer's banking information.

It displays:

Account status
Total balance
10-digit account number
Username
Last login
Account information
👤 Profile

The profile page allows users to:

View personal information
View username
View account number
View account balance
View account status
Edit profile information
View recent transactions
🚨 Fraud Alerts

Users can view fraud alerts associated only with their own customer account.

The backend filters fraud alerts using the customer's ID:

Customer
    ↓
Account
    ↓
Fraud Alert

This prevents users from viewing fraud alerts belonging to other customers.

🔒 Protected Routes

Authenticated pages are protected using React Router.

Users who are not logged in are redirected to:

/login

Protected pages include:

/dashboard
/profile
/deposit
/withdraw
/transfer
/transactions
/fraud-alerts
📁 Project Structure
BANKING-SYSTEM/
│
├── backend/
│   │
│   ├── app.py
│   ├── db.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .gitignore
│   │
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── account_routes.py
│   │   ├── transaction_routes.py
│   │   └── fraud_routes.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── account_service.py
│   │   ├── transaction_services.py
│   │   └── fraud_services.py
│   │
│   └── utils/
│       └── validators.py
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   │
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── stored-procedures/
│   ├── triggers/
│   ├── tables/
│   └── seed.sql
│
├── .gitignore
└── README.md
⚙️ Local Setup
1. Clone the Repository
git clone https://github.com/landezubenathi/banking-system.git

cd banking-system
🐍 Backend Setup

Navigate to the backend:

cd backend

Create a virtual environment:

python -m venv venv

Activate the environment on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create your environment file:

.env

Configure your SQL Server connection according to your local environment.

Run the Flask API:

python app.py

The backend should be available at:

http://localhost:5000

You can test the API using:

GET /

Expected response:

{
    "message": "API is running 🚀"
}
⚛️ Frontend Setup

Open a new terminal and navigate to the frontend:

cd frontend

Install dependencies:

npm install

Create:

.env

Configure:

VITE_API_URL=http://localhost:5000

Start the React application:

npm run dev

The frontend will normally be available at:

http://localhost:5173
🗃️ Database Setup

The application requires:

Microsoft SQL Server
SQL Server Management Studio (SSMS)
ODBC Driver 17 for SQL Server or compatible SQL Server ODBC driver

Create the database:

BankingSystemAndFraudDetectonDB

Then execute the database scripts in the appropriate order:

1. Tables
2. Constraints
3. Stored Procedures
4. Triggers
5. Seed/Test Data
🔑 Environment Variables

Sensitive configuration should not be committed to GitHub.

Example backend environment configuration:

DB_SERVER=your-server
DB_DATABASE=BankingSystemAndFraudDetectonDB
DB_USERNAME=your-username
DB_PASSWORD=your-password

Example frontend configuration:

VITE_API_URL=http://localhost:5000

The actual .env files should remain excluded through .gitignore.

🚀 Future Improvements

Potential improvements include:

JWT-based authentication
Role-based access control
Admin dashboard
Advanced fraud detection rules
Real-time fraud notifications
Email/SMS notifications
Two-factor authentication
Transaction pagination
Improved API validation
Automated testing
Docker containerization
Cloud database deployment
Cloud backend deployment
CI/CD pipeline
API documentation using Swagger/OpenAPI
📌 Project Strengths
Full-stack React + Flask architecture
SQL Server relational database
Stored procedure-based business logic
Automated database-level fraud detection
Password hashing
Protected frontend routes
Customer-specific fraud alerts
Automatic bank account creation
10-digit bank account numbers
Modular backend service architecture
REST API integration
Responsive web interface
👨‍💻 Authors
Liyabona Mafusini & Zubenathi Lande

Software Development Graduates
Walter Sisulu University

📜 License

This project is developed for educational and portfolio purposes.