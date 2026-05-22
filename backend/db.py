import pyodbc

def get_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=YOUR_TEAMMATE_IP_OR_HOST;"
        "DATABASE=BankingSystem;"
        "UID=your_username;"
        "PWD=your_password;"
    )