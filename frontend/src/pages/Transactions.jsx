import { useState } from "react";
import API from "../services/api";

function Transactions() {
  const [accountId, setAccountId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");

  const loadTransactions = async () => {
    try {
      const response = await API.get(
        `/transactions/${accountId}`
      );

      if (response.data.status === "success") {
        setTransactions(response.data.transactions);
        setMessage("");
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Failed to load transactions");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Transaction History</h1>

      <input
        type="number"
        placeholder="Account ID"
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
      />

      <button onClick={loadTransactions}>
        View Transactions
      </button>

      <br /><br />

      {message && <p>{message}</p>}

      {transactions.map((t) => (
        <div
          key={t.transaction_id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <p><strong>ID:</strong> {t.transaction_id}</p>
          <p><strong>Type:</strong> {t.type}</p>
          <p><strong>Amount:</strong> R {t.amount}</p>
          <p><strong>Date:</strong> {t.date}</p>
          <p>
            <strong>Reference Account:</strong>
            {" "}
            {t.reference_account || "N/A"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Transactions;