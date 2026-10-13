import { useEffect, useState } from "react";
import API from "../services/api";

import "../styles/table.css";

function Transactions() {
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await API.get(`/accounts/${user.customer_id}`);

      setAccounts(response.data);

      if (response.data.length > 0) {
        const firstAccount = response.data[0].account_id;
        setSelectedAccount(firstAccount);
        loadTransactions(firstAccount);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load accounts");
    }
  };

  const loadTransactions = async (accountId) => {
    try {
      const response = await API.get(`/transactions/${accountId}`);

      if (response.data.status === "success") {
        setTransactions(response.data.transactions);
        setCurrentPage(1);
        setMessage("");
      } else {
        setTransactions([]);
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setTransactions([]);
      setMessage("Failed to load transactions");
    }
  };

  const handleAccountChange = (e) => {
    const accountId = e.target.value;
    setSelectedAccount(accountId);
    loadTransactions(accountId);
  };

  // Pagination calculations
  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;

  const currentTransactions = transactions.slice(firstIndex, lastIndex);

  const totalPages =
    Math.max(1, Math.ceil(transactions.length / rowsPerPage));

  return (
    <div className="page-card">

      <h2 className="page-title">Transaction History</h2>

      <div className="form-group">
        <label>Select Account</label>

        <select
          value={selectedAccount}
          onChange={handleAccountChange}
        >
          {accounts.map((account) => (
            <option
              key={account.account_id}
              value={account.account_id}
            >
              Account Number: {account.account_number}
            </option>
          ))}
        </select>
      </div>

      {message && <p>{message}</p>}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >
        <div>
          <label>Rows per page: </label>

          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <p>
          Showing {currentTransactions.length} of {transactions.length} transaction(s)
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Related Account</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>

          {currentTransactions.length === 0 ? (

            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No transactions found.
              </td>
            </tr>

          ) : (

            currentTransactions.map((transaction) => (

              <tr key={transaction.transaction_id}>
                <td>{transaction.transaction_id}</td>
                <td>{transaction.type}</td>
                <td>{transaction.reference_account_number || "—"}</td>
                <td>R {Number(transaction.amount).toFixed(2)}</td>
                <td>{new Date(transaction.date).toLocaleString()}</td>
              </tr>

            ))

          )}

        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          marginTop: "20px"
        }}
      >

        <button
          className="primary-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((page) => page - 1)}
        >
          Previous
        </button>

        <strong>
          Page {currentPage} of {totalPages}
        </strong>

        <button
          className="primary-btn"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((page) => page + 1)}
        >
          Next
        </button>

      </div>

    </div>
  );
}

export default Transactions;