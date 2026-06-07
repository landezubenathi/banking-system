import pyodbc

'''def get_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ZUBENATHI-PC;"
        "DATABASE=BankingSystemAndFraudDetectonDB;"
        "Trusted_Connection=yes;"
    )
'''

def get_connection():
    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ZUBENATHI-DESKT\\SQLEXPRESS;"
        "DATABASE=BankingSystemAndFraudDetectonDB;"
        "Trusted_Connection=yes;"
    )

    return conn