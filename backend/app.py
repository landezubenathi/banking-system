import os

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from routes.auth_routes import auth_bp
from routes.account_routes import account_bp
from routes.transaction_routes import transaction_bp
from routes.fraud_routes import fraud_bp

load_dotenv()

app = Flask(__name__)


# ==========================================
# CORS Configuration
# ==========================================

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173","https://victorious-stone-0ee0f6c10.7.azurestaticapps.net/"
)

CORS(
    app,
    origins=[
        origin.strip()
        for origin in cors_origins.split(",")
    ]
)


# ==========================================
# Home / Health Check
# ==========================================

@app.route("/")
def home():

    return jsonify({
        "status": "success",
        "message": "LAMA Bank API is running 🚀"
    })


# ==========================================
# Register Blueprints
# ==========================================

app.register_blueprint(auth_bp)
app.register_blueprint(account_bp)
app.register_blueprint(transaction_bp)
app.register_blueprint(fraud_bp)


# ==========================================
# Run Application
# ==========================================

if __name__ == "__main__":

    debug_mode = (
        os.getenv("FLASK_DEBUG", "False").lower()
        == "true"
    )

    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=debug_mode
    )