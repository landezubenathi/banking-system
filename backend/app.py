import os

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from routes.auth_routes import auth_bp
from routes.account_routes import account_bp
from routes.transaction_routes import transaction_bp
from routes.fraud_routes import fraud_bp

# Load environment variables
load_dotenv()


app = Flask(__name__)

# Frontend URL
frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)


# Allow requests from the frontend
CORS(
    app,
    origins=[frontend_url]
)


# --------------------------------------------------
# API HOME
# --------------------------------------------------

@app.route("/")
def home():

    return jsonify({
        "status": "success",
        "message": "LAMA Bank API is running 🚀"
    })


# --------------------------------------------------
# REGISTER BLUEPRINTS
# --------------------------------------------------

app.register_blueprint(auth_bp)
app.register_blueprint(account_bp)
app.register_blueprint(transaction_bp)
app.register_blueprint(fraud_bp)


# --------------------------------------------------
# RUN APPLICATION
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=False
    )