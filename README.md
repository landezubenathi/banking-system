# 🏦 Banking System with Fraud Detection

A full-stack banking simulation system built using **React, Flask, and SQL Server**, featuring core banking operations and automated fraud detection using database triggers and stored procedures.

---

## Project Overview

This system simulates real-world banking operations including:

- Customer registration and authentication
- Bank account management
- Deposits, withdrawals, and transfers
- Transaction history tracking
- Automated fraud detection system

The project demonstrates **full-stack development, database design, API integration, and backend automation using SQL Server logic**.

---

## Key Objectives

- Build a realistic banking system simulation
- Implement secure backend architecture using Flask
- Use SQL Server for business logic and data integrity
- Implement automated fraud detection using triggers
- Develop a responsive frontend using React
- Demonstrate system design and full-stack integration

---

## Technology Stack

### Frontend
- React.js
- JavaScript (ES6+)
- Axios (API communication)

### Backend
- Flask (Python)
- PyODBC (SQL Server connection)

### Database
- Microsoft SQL Server
- T-SQL (Stored Procedures & Triggers)

---

## 🏗️ System Architecture


React Frontend
↓
Flask API Layer
↓
SQL Server (Business Logic + Data Layer)


---

## 🔄 System Workflow

```

User Action (Frontend)
↓
Flask API Request
↓
Stored Procedure Execution
↓
Transaction Inserted
↓
Fraud Trigger Executes
↓
Account Updated / Frozen
↓
Response Returned to UI
```

---

### Database Design

Core Tables
Customers
Stores personal user information
Users
Handles authentication data
Accounts
Stores account balances and status
Transactions
Logs all financial activities
FraudAlerts
Stores suspicious transaction records

---

## ⚙️ Key Database Features

### ✅ Stored Procedures
CreateCustomerProfile
CreateAccount
DepositMoney
WithdrawMoney
TransferMoney

#### 🚨 Fraud Detection Trigger

Automatically detects suspicious transactions:

Rule:

If transaction amount > 10,000

System Actions:

Freeze account
Insert fraud alert record

#### 🚨 Fraud Detection Logic

Implemented using SQL Server Trigger:

Monitors all inserted transactions
Automatically detects high-value transactions
Freezes affected accounts
Logs fraud alerts

---

## 🔌 Backend (Flask API)

### Core Responsibilities

Handle API requests
Execute SQL stored procedures
Validate user input
Manage authentication flow
Return JSON responses

### 📡 API Endpoints

#### Authentication

POST /register → Register user
POST /login → User login
##### Accounts
POST /create-account → Create account
GET /accounts → Fetch accounts
##### Transactions
POST /deposit → Deposit funds
POST /withdraw → Withdraw funds
POST /transfer → Transfer funds
GET /transactions/<account_id> → Transaction history

---

## 💻 Frontend (React)

### Pages

- Login Page
- Registration Page
- Dashboard
- Deposit Page
- Withdraw Page
- Transfer Page
- Transaction History Page

### Key Features
Real-time account balance display
Transaction management interface
Fraud alert visibility
Account status indicator (ACTIVE / FROZEN)
Protected routes for authenticated users

### 🔐 Authentication System
Username & password login
User linked to customer profile
(Optional upgrade: JWT authentication support)

### 🚨 Fraud Detection System

Rules
Condition	Action
Transaction > 10,000	Freeze account
Suspicious activity	Create fraud alert
Implementation
SQL Server Trigger (AFTER INSERT)
Fully automated at database level
No dependency on backend logic

### 📊 Key Features Summary
#### 👤 User Features
Register account
Login authentication
View dashboard

#### 💳 Banking Features

Deposit funds
Withdraw funds
Transfer money
View transaction history

#### 🚨 Fraud Features

Automatic fraud detection
Account freezing system
Fraud alert logging

### 🧱 Project Structure

#### Backend (Flask)
```
banking-backend/
│
├── app.py
├── db.py
├── routes/
├── services/

```

#### Frontend (React)

```
src/
│
├── pages/
├── components/
├── services/
├── context/
```

---

### 🔄 Future Improvements
JWT authentication
Password hashing (bcrypt)
Admin fraud dashboard
Real-time notifications (WebSockets)
Role-based access control
Deployment on cloud (Azure/AWS)

#### 📌 System Strengths

Clean 3-layer architecture
Database-driven business logic
Automated fraud detection
Scalable backend structure
Modular frontend design


## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/landezubenathi/banking-system.git
cd banking-system

---

Backend
cd backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
python app.py

cd frontend
npm install
npm start

```

## 👨‍💻 Authors

#### Liyabona Mafusini & Zubenathi Lande
Software Development Graduates
Walter Sisulu University
