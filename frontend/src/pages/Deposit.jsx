import { useState } from "react";
import API from "../services/api";

function Deposit() {
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleDeposit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/deposit", {
        account_id: Number(accountId),
        amount: Number(amount)
      });

      setMessage(response.data.message);
    } catch (error) {
      setMessage("Deposit failed");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Deposit Page</h1>

      <form onSubmit={handleDeposit}>
        <input
          type="number"
          placeholder="Account ID"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        />

        <br /><br />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <br /><br />

        <button type="submit">
          Deposit
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Deposit;