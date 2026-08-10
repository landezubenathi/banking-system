import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

def get_connection():

    driver = os.getenv("DB_DRIVER", "ODBC Driver 18 for SQL Server")
    server = os.getenv("DB_SERVER")
    database = os.getenv("DB_NAME")
    username = os.getenv("DB_USERNAME")
    password = os.getenv("DB_PASSWORD")
    trusted_connection = os.getenv(
        "DB_TRUSTED_CONNECTION",
        "no"
    )

    if trusted_connection.lower() == "yes":

        connection_string = (
            f"DRIVER={{{driver}}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            "Trusted_Connection=yes;"
            "TrustServerCertificate=yes;"
        )

    else:

        connection_string = (
            f"DRIVER={{{driver}}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={username};"
            f"PWD={password};"
            "Encrypt=yes;"
            "TrustServerCertificate=no;"
        )

    return pyodbc.connect(connection_string)