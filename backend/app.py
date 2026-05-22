from flask import Flask, jsonify
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.account_routes import account_bp
from routes.transaction_routes import transaction_bp

app = Flask(__name__)
CORS(app)

# 👇 ADD THIS
@app.route('/')
def home():
    return jsonify({"message": "API is running 🚀"})

# Register routes
app.register_blueprint(auth_bp)
app.register_blueprint(account_bp)
app.register_blueprint(transaction_bp)

if __name__ == "__main__":
    app.run(debug=True)