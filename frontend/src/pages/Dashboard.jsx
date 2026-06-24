import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

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

    return (
        <div>
            {message && <p>{message}</p>}
        </div>
    );
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
    <div>
      <h1>Dashboard</h1>

      <h3>Welcome {user?.full_name}</h3>

      <p>Username: {user?.username}</p>

      <p>Customer ID: {user?.customer_id}</p>

      <hr />

      <h2>My Accounts</h2>

        {
          accounts.map(
            (account) => (  
              <div
                key={account.account_id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "10px"
                }}
              >
              <h3>Account #{account.account_id}</h3>

              <p>Balance: R {account.balance}</p>

              <p>Status: {account.status}</p>

              <button onClick={() => navigate(`/accounts/${account.account_id}`)}>Select Account</button>
              </div>
            )
          )
        }

      <div style={{ padding: "15px"}}>
          <button onClick={handleCreateAccount}>
            Create New Account
          </button>
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
      <div style={{ marginTop: "10px" }}></div>

      <button onClick={() => navigate("/fraud-alerts")}>
        Fraud Alerts
      </button>

      <hr />
      <button onClick={handleLogout}>
          Logout
      </button>
      
    </div>
    
  );
}

export default Dashboard;