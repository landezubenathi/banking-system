import { useState } from "react";
import API from "../services/api";

function Transfer() {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleTransfer = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/transfer", {
        from_account: Number(fromAccount),
        to_account: Number(toAccount),
        amount: Number(amount)
      });

      setMessage(response.data.message);
    } catch (error) {
      setMessage("Transfer failed");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Transfer Money</h1>

      <form onSubmit={handleTransfer}>

        <input
          type="number"
          placeholder="From Account ID"
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
        />

        <br /><br />

        <input
          type="number"
          placeholder="To Account ID"
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
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
          Transfer
        </button>

      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Transfer;