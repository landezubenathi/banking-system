import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

//import "./Dashboard.css";

import AccountCard from "../components/AccountCard";

import "../styles/dashboard.css";
import "../styles/sidebar.css";
import "../styles/navbar.css";
import "../styles/card.css";
import "../styles/forms.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    loadAccount();
  }, []);

  const handleLogout = async () => {
  try {
    await API.post("/logout", {
      user_id: user.user_id
    });
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const [message, setMessage] = useState("");

  const handleCreateAccount = async () => {
    try {
      const response = await API.post("/create-account", {
        customer_id: user.customer_id
      });

      setMessage(response.data.message);

      //await loadAccounts();

    } catch (error) {
      console.error(error);
      alert("Failed to create account");
    }
    
  };

  const loadAccount = async () => {
    try {
      const response = await API.get(
        `/accounts/${user.customer_id}`
      );

      console.log("Account Response:", response.data);

      if (response.data.length > 0) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (accountId) => {

    try {

        const response = await API.post(
            "/toggle-account-status",
            {
                account_id: accountId
            }
        );

        alert(response.data.message);

        loadAccount();

    } catch (error) {

        console.error(error);
        alert("Failed to update account status");

    }

  };

  return (
  <div>

    {/* Welcome */}
    <div className="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p>Your banking overview</p>
      </div>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>

    {/* Statistics */}
    <div className="stats-grid">

      <div className="stat-card">
        <h4>Total Accounts</h4>
        <h2>{accounts.length}</h2>
      </div>

      <div className="stat-card">
        <h4>Total Balance</h4>
        <h2>
          R{" "}
          {accounts
            .reduce(
              (sum, account) =>
                sum + Number(account.balance),
              0
            )
            .toFixed(2)}
        </h2>
      </div>

      <div className="stat-card">
        <h4>Customer ID</h4>
        <h2>{user.customer_id}</h2>
      </div>

      <div className="stat-card">
        <h4>Username</h4>
        <h2>{user.username}</h2>
      </div>

      <div className="stat-card">
        <h4>Last Login</h4>

        <h2>
          {user.last_login
            ? new Date(user.last_login).toLocaleString()
            : "First Login"}
        </h2>
      </div>

    </div>

    {/* Accounts */}
    <h2 className="section-title">
      My Accounts
    </h2>

    <div className="accounts-grid">

      {accounts.map(account => (

        <AccountCard
          key={account.account_id}
          account={account}
        />

      ))}

    </div>
    

    {/* Create Account */}
    <div style={{marginTop:"25px"}}>

      <button
        className="primary-btn"
        onClick={handleCreateAccount}
      >
        + Create New Account
      </button>

    </div>

    {/* Message */}
    {message && (
      <div className="success-message">
        {message}
      </div>
    )}

  </div>
);
}

export default Dashboard;