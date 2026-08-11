# 🏦 Banking System – Backend

Flask REST API backend for the Banking System with Fraud Detection.

The backend handles authentication, customer profiles, bank accounts, transactions, and fraud detection while communicating with Microsoft SQL Server.

---

## 🛠️ Technology Stack

- Python 3.x
- Flask
- Flask-CORS
- PyODBC
- Microsoft SQL Server
- T-SQL
- SQL Server Stored Procedures
- SQL Server Triggers
- Werkzeug Password Hashing
- python-dotenv

---

## 📁 Project Structure

```text
backend/
│
├── app.py
├── db.py
├── requirements.txt
├── .env
├── .env.example
├── .gitignore
│
├── routes/
│   ├── auth_routes.py
│   ├── account_routes.py
│   ├── transaction_routes.py
│   └── fraud_routes.py
│
├── services/
│   ├── auth_service.py
│   ├── account_service.py
│   ├── transaction_services.py
│   └── fraud_services.py
│
└── utils/
    └── validators.py
