import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/forms.css";

function Withdraw() {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedAccount = accounts.find((a) => String(a.account_id) === String(accountId));
  const frozen = String(selectedAccount?.status || "").toUpperCase() === "FROZEN";
  const unavailable = !!selectedAccount && String(selectedAccount.status || "").toUpperCase() !== "ACTIVE";

  // Older backend versions referred to internal AccountId in messages.
  // Only replace the ID of the selected account with its customer-facing number.
  const friendlyAccountMessage = (text) => {
    const original = String(text || "");
    if (!selectedAccount?.account_number) return original;
    const id = String(selectedAccount.account_id);
    if (!/^\d+$/.test(id)) return original;
    return original.replace(
      new RegExp(String.raw`\bAccount\s+${id}(?=\s|[.,!]|$)`, "i"),
      `Account ${selectedAccount.account_number}`
    );
  };

  const loadAccounts = async () => {
    if (!user?.customer_id) {
      setIsError(true);
      setMessage("Please log in again to continue.");
      return;
    }
    try {
      const response = await API.get(`/accounts/${user.customer_id}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setAccounts(data);
      setAccountId((previous) =>
        data.some((a) => String(a.account_id) === String(previous))
          ? previous
          : String(data[0]?.account_id ?? "")
      );
    } catch (error) {
      console.error(error);
      setIsError(true);
      setMessage(error.response?.data?.message || "We couldn't load your accounts. Please try again.");
    }
  };

  useEffect(() => {
    loadAccounts();
    // Account list should be loaded once when entering this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWithdraw = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!selectedAccount) {
      setIsError(true);
      setMessage("Please select an account.");
      return;
    }
    if (unavailable) {
      setIsError(true);
      setMessage(`Account ${selectedAccount.account_number} is ${frozen ? "frozen" : "unavailable"}. You can't withdraw money until it has been reviewed.`);
      return;
    }
    const value = String(amount).trim();
    if (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) <= 0) {
      setIsError(true);
      setMessage("Please enter a valid amount greater than R0.00 with up to two decimal places.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await API.post("/withdraw", {
        account_id: Number(accountId),
        amount: Number(value)
      });
      if (response.data.status !== "success") {
        setIsError(true);
        setMessage(friendlyAccountMessage(response.data.message || "We couldn't complete your request."));
        return;
      }
      setIsError(false);
      setMessage(response.data.message || "Withdraw successful.");
      setAmount("");
      await loadAccounts();
    } catch (error) {
      console.error(error);
      setIsError(true);
      setMessage(friendlyAccountMessage(error.response?.data?.message || "We couldn't complete your withdraw right now. Please try again later."));
      if (error.response?.data?.code === "ACCOUNT_FROZEN") {
        await loadAccounts();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-card">
      <h2 className="page-title">Withdraw Money</h2>
      <form className="form-group" onSubmit={handleWithdraw}>
        <label htmlFor="withdraw-account">Select Account</label>
        <select
          id="withdraw-account"
          value={accountId}
          onChange={(event) => { setAccountId(event.target.value); setMessage(""); }}
          required
        >
          {accounts.map((account) => (
            <option key={account.account_id} value={account.account_id}>
              {account.account_number} ({account.status}) - R{Number(account.balance).toFixed(2)}
            </option>
          ))}
        </select>

        {unavailable && (
          <p className="error-message" role="alert">
            {frozen
              ? `Account ${selectedAccount.account_number} is frozen. Withdrawals are unavailable until the account has been reviewed.`
              : `Account ${selectedAccount.account_number} is unavailable for withdrawals. Please contact support.`}
          </p>
        )}

        <label htmlFor="withdraw-amount" style={{ marginTop: "16px" }}>Amount (R)</label>
        <input
          id="withdraw-amount"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          min="0.01"
          step="0.01"
          required
        />
        <button className="primary-btn" type="submit"
          disabled={submitting || unavailable || !selectedAccount}>
          {submitting ? "Processing..." : "Withdraw Money"}
        </button>
      </form>
      {message && (
        <p className={isError ? "error-message" : "success-message"} role={isError ? "alert" : "status"}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Withdraw;
