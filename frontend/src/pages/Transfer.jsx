import { useEffect, useState } from "react";
import API from "../services/api";

import "../styles/forms.css";

function Transfer() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await API.get(`/accounts/${user.customer_id}`);

      setAccounts(response.data);

      if (response.data.length > 0) {
        setFromAccount(response.data[0].account_id);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load accounts");
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/transfer", {
        from_account: Number(fromAccount),
        to_account: Number(toAccount),
        amount: Number(amount)
      });

      setMessage(response.data.message);

      // Clear fields after success
      setToAccount("");
      setAmount("");

      // Refresh balances
      loadAccounts();

    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Transfer failed");
      }
    }
  };

  return (
    <div className="page-card">

      <h2 className="page-title">Transfer Money</h2>

      <form className="form-group" onSubmit={handleTransfer}>

        <label>From Account</label>

        <select
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
        >
          {accounts.map((account) => (
            <option
              key={account.account_id}
              value={account.account_id}
            >
              Account #{account.account_id} ({account.status}) - R{" "}
              {Number(account.balance).toFixed(2)}
            </option>
          ))}
        </select>

        <br /><br />

        <label>Recipient Account ID</label>

        <input
          type="number"
          placeholder="Enter recipient account ID"
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
          required
        />

        <br /><br />

        <label>Amount</label>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="1"
          step="0.01"
        />

        <br /><br />

        <button className="primary-btn" type="submit">
          Transfer Money
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

export default Transfer;