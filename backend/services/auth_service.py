from db import get_connection
from werkzeug.security import generate_password_hash, check_password_hash


def register_user(data):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        # Create Customer Profile
        cursor.execute("""
            EXEC CreateCustomerProfile ?, ?, ?, ?, ?
        """,
        (
            data["full_name"],
            data["email"],
            data["phone"],
            data["username"],
            generate_password_hash(data["password"])
        ))

        conn.commit()


        # Get the newly created CustomerId
        cursor.execute("""
            SELECT CustomerId
            FROM Customers
            WHERE Email = ?
        """,
        (
            data["email"],
        ))

        customer = cursor.fetchone()


        if customer is None:

            return {
                "status": "error",
                "message": "Customer profile created but ID was not found."
            }


        customer_id = customer.CustomerId


        # Create Bank Account
        cursor.execute(
            "EXEC CreateAccount ?",
            (
                customer_id,
            )
        )


        conn.commit()


        return {
            "status": "success",
            "message": "User registered and bank account created successfully.",
            "customer_id": customer_id
        }

    except Exception as e:

        conn.rollback()

        return {
            "status": "error",
            "message": str(e)
        }

    finally:

        conn.close()


def login(username, password):
    """Authenticate a user and record the UTC time of a SUCCESSFUL login.

    LastLogin is deliberately not changed for incorrect credentials.
    The returned timestamp is an ISO-8601 UTC value so browsers parse it
    correctly and display it in the user's local timezone.
    """
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("EXEC UserLogin ?", (username,))

        if cursor.description is None:
            return {
                "status": "error",
                "message": "No user data returned"
            }

        user = cursor.fetchone()
        if user is None or not check_password_hash(user.PasswordHash, password):
            return {
                "status": "error",
                "message": "Invalid username or password"
            }

        # Store LAST SUCCESSFUL LOGIN, not logout time.
        # SQL Server's LastLogin column is DATETIME; GETUTCDATE() is UTC.
        cursor.execute("""
            UPDATE dbo.Users
            SET LastLogin = GETUTCDATE()
            WHERE UserId = ?
        """, (user.UserId,))

        cursor.execute("""
            SELECT LastLogin
            FROM dbo.Users
            WHERE UserId = ?
        """, (user.UserId,))
        login_row = cursor.fetchone()
        if login_row is None or login_row.LastLogin is None:
            raise RuntimeError("Could not retrieve updated login time")

        conn.commit()
        last_login_utc = login_row.LastLogin.isoformat(timespec="milliseconds") + "Z"

        return {
            "status": "success",
            "user_id": user.UserId,
            "customer_id": user.CustomerId,
            "username": user.Username,
            "full_name": user.FullName,
            "email": user.Email,
            "phone_number": user.PhoneNumber,
            "last_login": last_login_utc
        }

    except Exception as e:
        conn.rollback()
        if "Username not found" in str(e):
            return {
                "status": "error",
                "message": "Incorrect username or password."
            }
        # Do not return SQL Server details to the browser.
        return {
            "status": "error",
            "message": "Unable to log in. Please try again later."
        }
    finally:
        conn.close()

def get_profile(customer_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            U.Username,
            U.LastLogin,
            C.CustomerId,
            C.FullName,
            C.Email,
            C.PhoneNumber
        FROM Users U
        INNER JOIN Customers C
            ON U.CustomerId = C.CustomerId
        WHERE C.CustomerId = ?
    """, (customer_id,))

    row = cursor.fetchone()

    conn.close()

    return {
        "customer_id": row.CustomerId,
        "username": row.Username,
        "full_name": row.FullName,
        "email": row.Email,
        "phone_number": row.PhoneNumber,
        "last_login": str(row.LastLogin) if row.LastLogin else None
    }

def update_profile(customer_id, full_name, email, phone_number):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            EXEC UpdateProfile ?, ?, ?, ?
        """,
        (
            customer_id,
            full_name,
            email,
            phone_number
        ))

        conn.commit()

        return {
            "status": "success",
            "message": "Profile updated successfully"
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }

    finally:
        conn.close()