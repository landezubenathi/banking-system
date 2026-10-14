import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/forms.css";

function Withdraw() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

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

  // Never trust cached customer_id or read it once during the first render.
  // Resolve the identity via the SQL-session-protected backend /me endpoint.
  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      if (!sessionStorage.getItem("lama_token")) {
        throw new Error("Your login session was not saved. Please sign out and sign in again.");
      }

      const identity = await API.get("/me");
      const customerId = Number(identity.data?.customer_id);
      if (!Number.isSafeInteger(customerId) || customerId <= 0) {
        throw new Error("Your customer profile could not be verified. Please sign in again.");
      }

      const response = await API.get(`/accounts/${customerId}`);
      if (!Array.isArray(response.data)) {
        throw new Error("The server did not return a valid account list.");
      }
      const data = response.data;
      setAccounts(data);
      setAccountId((previous) =>
        data.some((a) => String(a.account_id) === String(previous))
          ? previous
          : String(data[0]?.account_id ?? "")
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
      setAccountId("");
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
          disabled={submitting || loadingAccounts || unavailable || !selectedAccount}>
          {submitting ? "Processing..." : "Withdraw Money"}
        </button>
      </form>
      {loadingAccounts && <p role="status">Loading your accounts securely...</p>}
      {!loadingAccounts && accounts.length === 0 && (
        <button type="button" onClick={loadAccounts} className="primary-btn">Retry loading accounts</button>
      )}
      {message && (
        <p className={isError ? "error-message" : "success-message"} role={isError ? "alert" : "status"}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Withdraw;
