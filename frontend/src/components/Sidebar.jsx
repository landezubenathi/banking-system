import { useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
    try {
        await API.post("/logout", {
        user_id: user.user_id
        });
        } catch (error) {
        console.error(error);
        }

        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <div className="sidebar">

            <h2>🏦 LAMA Bank</h2>

            <button onClick={() => navigate("/dashboard")}>
                🏠 Dashboard
            </button>

            <button onClick={() => navigate("/deposit")}>
                💰 Deposit
            </button>

            <button onClick={() => navigate("/withdraw")}>
                💸 Withdraw
            </button>

            <button onClick={() => navigate("/transfer")}>
                🔄 Transfer
            </button>

            <button onClick={() => navigate("/transactions")}>
                📄 Transactions
            </button>

            <button onClick={() => navigate("/fraud-alerts")}>
                🚨 Fraud Alerts
            </button>

            <button onClick={() => navigate("/profile")}>
                👤 Profile
            </button>

            <button
                className="logout-btn"
                onClick={handleLogout}
            >
                Logout
            </button>

        </div>
    );
}

export default Sidebar;