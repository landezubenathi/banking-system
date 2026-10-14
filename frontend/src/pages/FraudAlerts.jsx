import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import API from "../services/api";

import "../styles/forms.css";

function FraudAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const { user } = useOutletContext();

  useEffect(() => {
    loadAlerts();
    loadAccounts();
  }, []);

  const loadAlerts = async () => {
    try {
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

    } catch (error) {
      console.error(error);
      setAccounts([]);
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

            <p><strong>Account Number:</strong> {accounts.find((account) => Number(account.account_id) === Number(alert.account_id))?.account_number || "N/A"}</p>

            <p><strong>Amount:</strong> R {Number(alert.amount).toFixed(2)}</p>

            <p><strong>Date:</strong> {new Date(alert.date).toLocaleString()}</p>

          </div>
        ))
      )}
    </div>
  );
}

export default FraudAlerts;