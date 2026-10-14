import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import API from "../services/api";
import "../styles/forms.css";

const ACCOUNT_NUMBER_REGEX = /^[0-9]{7,10}$/;

function Transfer() {
  const { user } = useOutletContext();

  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  // Never trust cached customer_id or read it once during the first render.
  // Resolve the identity via the SQL-session-protected backend /me endpoint.
  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      // MainLayout already verified this identity with Flask /me.
      // Do not call /me again or rely on a legacy localStorage user.
      const customerId = Number(user?.customer_id);
      if (!Number.isSafeInteger(customerId) || customerId <= 0) {
        throw new Error("Your customer profile could not be verified. Please sign in again.");
      }

      const response = await API.get(`/accounts/${customerId}`);
      if (!Array.isArray(response.data)) {
        throw new Error("The server did not return a valid account list.");
      }
      const data = response.data;
      setAccounts(data);
      setFromAccount((previous) =>
        data.some((account) => String(account.account_number) === String(previous))
          ? previous
          : String(data[0]?.account_number ?? "")
      );
      if (!data.length) {
        setIsError(true);
        setMessage("No bank accounts were found for this profile.");
      } else {
        setIsError(false);
        setMessage((previous) => previous.startsWith("We couldn't load") || previous.startsWith("Your login") || previous.startsWith("No bank") ? "" : previous);
      }
    } catch (error) {
      console.error("Account loading failed:", error.response?.status || error.message);
      setAccounts([]);
      setFromAccount("");
      setIsError(true);
      const status = error.response?.status;
      const path = String(error.config?.url || "");
      const reason = status === 404 && path === "/me"
        ? "The secure /me endpoint is missing on Render. Deploy the previous auth_routes.py update."
        : status === 403
          ? "Your session cannot access these accounts. Please sign out and sign in again."
          : status === 503
            ? "Account verification is temporarily unavailable. Please retry shortly."
            : error.response?.data?.message || error.message || "We couldn't load your accounts. Please retry.";
      setMessage(reason);
    } finally {
      setLoadingAccounts(false);
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
          disabled={submitting || loadingAccounts || !accounts.length}>
          {submitting ? "Transferring..." : "Transfer Money"}
        </button>
      </form>

      {loadingAccounts && <p role="status">Loading your accounts securely...</p>}
      {!loadingAccounts && accounts.length === 0 && (
        <button type="button" onClick={loadAccounts} className="primary-btn">Retry loading accounts</button>
      )}
      {message && (
        <p className={isError ? "error-message" : "success-message"} role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export default Transfer;
