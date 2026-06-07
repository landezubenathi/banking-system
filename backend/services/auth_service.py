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

    conn.close()

    if user:
        return {
            "status": "success",
            "user_id": user.UserId,
            "customer_id": user.CustomerId,
            "username": user.Username,
            "full_name": user.FullName
        }

    return {
        "status": "error",
        "message": "Invalid credentials"
    }