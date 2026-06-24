import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    loadAccount();
  }, []);

  const handleLogout = () => {
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <h3>Welcome {user?.full_name}</h3>
        <p>Username: {user?.username}</p>
        <p>Customer ID: {user?.customer_id}</p>
      </div>

      <hr />

      <h2>My Accounts</h2>

        {
          accounts.map(
            (account) => (  
              <div
                key={account.account_id}
                className="account-card"
              >
              <h3>Account #{account.account_id}</h3>

              <p>Balance: R {account.balance}</p>

              <p>
                Status:
                <span
                  className={
                    account.status === "ACTIVE"
                      ? "active"
                      : "frozen"
                  }
                >
                  {" "}{account.status}
                </span>
              </p>

              <button onClick={() => navigate(`/accounts/${account.account_id}`)}>Select Account</button>
              </div>
            )
          )
        }

      <div className="button-group">
          <button onClick={handleCreateAccount}>
            Create New Account
          </button>
          {message && <p>{message}</p>}
      </div>

      <hr />

      <h2>Banking Services</h2>

      <button onClick={() => navigate("/deposit")}>
        Deposit
      </button>

      <button onClick={() => navigate("/withdraw")}>
        Withdraw
      </button>

      <button onClick={() => navigate("/transfer")}>
        Transfer
      </button>

      <button onClick={() => navigate("/transactions")}>
        Transactions
      </button>
      <div className="button-group">
        <button onClick={() => navigate("/fraud-alerts")}>
          Fraud Alerts
        </button>
      </div>

      <hr />
      <button onClick={handleLogout} className="logout-btn">
          Logout
      </button>
      
    </div>
    
  );
}

export default Dashboard;