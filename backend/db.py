import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()


def get_connection():

    driver = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
    server = os.getenv("DB_SERVER")
    database = os.getenv("DB_NAME")
    username = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    trusted_connection = os.getenv(
        "DB_TRUSTED_CONNECTION",
        "yes"
    ).lower()

    if not server:
        raise ValueError("DB_SERVER is not configured")

    if not database:
        raise ValueError("DB_NAME is not configured")

    connection_string = (
        f"DRIVER={{{driver}}};"
        f"SERVER={server};"
        f"DATABASE={database};"
    )

    # Windows/local SQL Server authentication
    if trusted_connection == "yes":
        connection_string += "Trusted_Connection=yes;"

    # SQL Server username/password authentication
    else:

        if not username or not password:
            raise ValueError(
                "DB_USER and DB_PASSWORD are required "
                "when DB_TRUSTED_CONNECTION=no"
            )

        connection_string += (
            f"UID={username};"
            f"PWD={password};"
        )

    return pyodbc.connect(connection_string)