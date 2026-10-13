import { useEffect, useState } from "react";
import API from "../services/api";

import "../styles/forms.css";

function Withdraw() {
  const user = JSON.parse(sessionStorage.getItem("user"));

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

      if (response.data.length > 0) {
        setAccountId(response.data[0].account_id);
      }

    } catch (error) {
      console.error(error);
      setMessage("Failed to load accounts");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/withdraw", {
        account_id: Number(accountId),
        amount: Number(amount)
      });

      setMessage(response.data.message);
      setAmount("");

    } catch (error) {
      console.error(error);
      setMessage("Withdrawal failed");
    }
  };

  return (
    <div className="page-card">

      <h2 className="page-title">Withdraw Money</h2>

      <form className="form-group" onSubmit={handleWithdraw}>

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
              {account.account_number} ({account.status}) - R{" "}
              {Number(account.balance).toFixed(2)}
            </option>
          ))}
        </select>

        <br /><br />

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
          Withdraw
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

export default Withdraw;