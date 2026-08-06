import { useEffect, useState } from "react";
import API from "../services/api";

import "../styles/forms.css";

function FraudAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadAlerts();
    loadAccounts();
  }, []);

  const loadAlerts = async () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));

        const response = await API.get(
            `/fraud-alerts/${user.customer_id}`
        );
      setAlerts(response.data);
        } catch (error) {
        console.error(error);
        }
    };

  const loadAccounts = async () => {
    try {
      const response = await API.get(`/accounts/${user.customer_id}`);

      setAccounts(response.data);

      if (response.data.length > 0) {
        setFromAccount(response.data[0].account_id);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load accounts");
    }
  };

  return (
    <div className="page-card">
    <h2 className="page-title">Fraud Alerts</h2>

    {alerts.length === 0 ? (
      <p>No fraud alerts found.</p>
      ) : (
        alerts.map((alert) => (
          <div className="fraud-card" key={alert.alert_id}>

            <div className="fraud-header">
              <h3>Alert {alert.alert_id}</h3>

              <span
                className={
                  alert.status === "PENDING"
                    ? "pending"
                    : alert.status === "RESOLVED"
                    ? "resolved"
                    : "closed"
                }
              >
                {alert.status}
              </span>
            </div>

            <p><strong>Account Number:</strong> {accounts.length > 0
            ? accounts[0].account_number
            : "N/A"}</p>

            <p><strong>Amount:</strong> R {Number(alert.amount).toFixed(2)}</p>

            <p><strong>Date:</strong> {new Date(alert.date).toLocaleString()}</p>

          </div>
        ))
      )}
    </div>
  );
}

export default FraudAlerts;