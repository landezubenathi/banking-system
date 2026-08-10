import os
import pyodbc
from dotenv import load_dotenv # 

load_dotenv()


def get_connection():

    driver = os.getenv(
        "DB_DRIVER",
        "ODBC Driver 17 for SQL Server"
    )

    server = os.getenv("DB_SERVER")
    database = os.getenv("DB_DATABASE")

    trusted_connection = os.getenv(
        "DB_TRUSTED_CONNECTION",
        "yes"
    ).lower()

    # Windows Authentication
    if trusted_connection == "yes":

        connection_string = (
            f"DRIVER={{{driver}}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            "Trusted_Connection=yes;"
            "TrustServerCertificate=yes;"
        )

    # SQL Server Authentication
    else:

        username = os.getenv("DB_USERNAME")
        password = os.getenv("DB_PASSWORD")

        connection_string = (
            f"DRIVER={{{driver}}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={username};"
            f"PWD={password};"
            "TrustServerCertificate=yes;"
        )

    return pyodbc.connect(connection_string)
