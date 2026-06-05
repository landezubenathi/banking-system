
import pyodbc

def get_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ZUBENATHI-PC;"
        "DATABASE=Banking System;"
        "Trusted_Connection=yes;"
    )