import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/forms.css";

const ACCOUNT_NUMBER_REGEX = /^[0-9]{7,10}$/;

function Transfer() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    if (!user?.customer_id) {
      setIsError(true);
      setMessage("Please log in again.");
      return;
    }
    try {
      const response = await API.get(`/accounts/${user.customer_id}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setAccounts(data);
      setFromAccount((previous) =>
        data.some((account) => account.account_number === previous)
          ? previous
          : String(data[0]?.account_number ?? "")
      );
    } catch (error) {
      console.error(error);
      setIsError(true);
      setMessage("Failed to load your accounts.");
    }
  };

  const handleTransfer = async (event) => {
    event.preventDefault();
    setMessage("");

    const sender = String(fromAccount).trim();
    const recipient = toAccount.trim();
    const amountValue = Number(amount);

    if (!ACCOUNT_NUMBER_REGEX.test(sender) || !ACCOUNT_NUMBER_REGEX.test(recipient)) {
      setIsError(true);
      setMessage("Account numbers must contain 7 to 10 digits.");
      return;
    }
    if (sender === recipient) {
      setIsError(true);
      setMessage("You cannot transfer to the same account.");
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0 ||
        !/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
      setIsError(true);
      setMessage("Enter a valid amount with up to two decimal places.");
      return;
    }

    setSubmitting(true);
    try {
      // Account numbers are STRINGS; never Number() or parseInt() them.
      const response = await API.post("/transfer", {
        from_account: sender,
        to_account: recipient,
        amount: amountValue,
      });

      if (response.data.status !== "success") {
        throw new Error(response.data.message || "Transfer failed");
      }

      setIsError(false);
      setMessage(response.data.message);
      setToAccount("");
      setAmount("");
      await loadAccounts();
    } catch (error) {
      console.error(error);
      setIsError(true);
      setMessage(error.response?.data?.message || error.message || "Transfer failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-card">
      <h2 className="page-title">Transfer Money</h2>
      <p>Transfers use customer-facing account numbers. Demo transactions only.</p>

      <form className="form-group" onSubmit={handleTransfer}>
        <label htmlFor="transfer-from">From Account</label>
        <select
          id="transfer-from"
          value={fromAccount}
          onChange={(event) => setFromAccount(event.target.value)}
          required
        >
          {accounts.map((account) => (
            <option key={account.account_id} value={String(account.account_number)}>
              {account.account_number} ({account.status}) - R{Number(account.balance).toFixed(2)}
            </option>
          ))}
        </select>

        <br /><br />

        <label htmlFor="transfer-to">Recipient Account Number</label>
        <input
          id="transfer-to"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="7 to 10 digit account number"
          value={toAccount}
          onChange={(event) => setToAccount(event.target.value)}
          pattern="[0-9]{7,10}"
          minLength={7}
          maxLength={10}
          required
        />

        <br /><br />

        <label htmlFor="transfer-amount">Amount (R)</label>
        <input
          id="transfer-amount"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          min="0.01"
          step="0.01"
          required
        />

        <br /><br />

        <button className="primary-btn" type="submit"
          disabled={submitting || !accounts.length}>
          {submitting ? "Transferring..." : "Transfer Money"}
        </button>
      </form>

      {message && (
        <p className={isError ? "error-message" : "success-message"} role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export default Transfer;
