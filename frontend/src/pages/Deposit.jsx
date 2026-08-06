import { useEffect, useState } from "react";
import API from "../services/api";

import "../styles/forms.css";

function Deposit() {

  const user = JSON.parse(localStorage.getItem("user"));

  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await API.get(`/accounts/${user.customer_id}`);

      setAccounts(response.data);

      // Automatically select the first account
      if (response.data.length > 0) {
        setAccountId(response.data[0].account_id);
      }

    } catch (error) {
      console.error(error);
      setMessage("Failed to load accounts");
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/deposit", {
        account_id: Number(accountId),
        amount: Number(amount)
      });

      setMessage(response.data.message);
      setAmount("");

    } catch (error) {
      console.error(error);
      setMessage("Deposit failed");
    }
  };

  return (
    <div className="page-card">

      <h2 className="page-title">💰 Deposit Money</h2>

      <form onSubmit={handleDeposit}>

        <div className="form-group">
          <label>Select Account</label>

          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map((account) => (
              <option
                key={account.account_id}
                value={account.account_id}
              >
                Account #{account.account_id} ({account.status}) - R{" "}{Number(account.balance).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Amount</label>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button className="primary-btn" type="submit">
          Deposit
        </button>

      </form>

      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

    </div>
  );
}

export default Deposit;