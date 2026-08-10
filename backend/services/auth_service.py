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

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute(
            "EXEC UserLogin ?",
            (username,)
        )

        if cursor.description is None:
            return {
                "status": "error",
                "message": "No user data returned"
            }

        user = cursor.fetchone()

        if user is None:
            return {
                "status": "error",
                "message": "Invalid username or password"
            }

        # Verify the entered password against the stored hash
        if not check_password_hash(user.PasswordHash, password):
            return {
                "status": "error",
                "message": "Invalid username or password"
            }

        return {
            "status": "success",
            "user_id": user.UserId,
            "customer_id": user.CustomerId,
            "username": user.Username,
            "full_name": user.FullName,
            "email": user.Email,
            "phone_number": user.PhoneNumber,
            "last_login": str(user.LastLogin) if user.LastLogin else None
        }

    except Exception as e:

        error = str(e)

        # Hide SQL Server errors from the user
        if "Username not found" in error:
            return {
                "status": "error",
                "message": "Incorrect username or password."
            }

        return {
            "status": "error",
            "message": "Unable to log in. Please try again later."
        }

    finally:
        conn.close()

def update_last_login(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE Users
            SET LastLogin = GETDATE()
            WHERE UserId = ?
        """, (user_id,))

        conn.commit()

        return {
            "status": "success",
            "message": "Last login updated successfully"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
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