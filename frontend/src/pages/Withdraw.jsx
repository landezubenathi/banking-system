import { useState } from "react";
import API from "../services/api";

function Withdraw() {
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleWithdraw = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/withdraw", {
        account_id: Number(accountId),
        amount: Number(amount)
      });

      setMessage(response.data.message);
    } catch (error) {
      setMessage("Withdrawal failed");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Withdraw Money</h1>

      <form onSubmit={handleWithdraw}>

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
          Withdraw
        </button>

      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Withdraw;