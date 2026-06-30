from db import get_connection

def register_user(data):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            EXEC CreateCustomerProfile ?, ?, ?, ?, ?
        """, (
            data['full_name'],
            data['email'],
            data['phone'],
            data['username'],
            data['password_hash']
        ))

        conn.commit()
        return {"status": "success", "message": "User registered"}

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        conn.close()


def login(username, password):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
    "EXEC UserLogin ?, ?",
    (username, password)
    )

    if cursor.description is None:
        return {
            "status": "error",
            "message": "No user data returned"
        }

    user = cursor.fetchone()

    print("LOGIN RESULT:", user)

    conn.close()

    if user:
        return {
            "status": "success",
            "user_id": user.UserId,
            "customer_id": user.CustomerId,
            "username": user.Username,
            "full_name": user.FullName,
            "last_login": str(user.LastLogin) if user.LastLogin else None
        }

    return {
        "status": "error",
        "message": "Invalid credentials"
    }

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
            "message": "Logged out"
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