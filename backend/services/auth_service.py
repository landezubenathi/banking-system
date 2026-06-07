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


def login_user(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT UserId, Username
        FROM Users
        WHERE Username = ? AND PasswordHash = ?
    """, (data['Username'], data['PasswordHash']))

    user = cursor.fetchone()
    conn.close()

    if user:
        return {
            "status": "success",
            "UserId": user.UserId,
            "Username": user.Username
        }

    return {"status": "error", "message": "Invalid credentials"}