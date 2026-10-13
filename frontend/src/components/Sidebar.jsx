import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Revoke the server session, not just the browser copy.
      await API.post("/logout");
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      sessionStorage.removeItem("lama_token");
      sessionStorage.removeItem("user");
      localStorage.removeItem("user"); // Clear legacy login state.
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="sidebar">
      <h2>🏦 LAMA Bank</h2>
      <button onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
      <button onClick={() => navigate("/deposit")}>💰 Deposit</button>
      <button onClick={() => navigate("/withdraw")}>💸 Withdraw</button>
      <button onClick={() => navigate("/transfer")}>🔄 Transfer</button>
      <button onClick={() => navigate("/transactions")}>📄 Transactions</button>
      <button onClick={() => navigate("/fraud-alerts")}>🚨 Fraud Alerts</button>
      <button onClick={() => navigate("/profile")}>👤 Profile</button>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Sidebar;
