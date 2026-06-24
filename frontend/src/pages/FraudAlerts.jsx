import { useEffect, useState } from "react";
import API from "../services/api";

function FraudAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
        const response = await API.get("/fraud-alerts");
      setAlerts(response.data);
        } catch (error) {
        console.error(error);
        }
    };

  return (
    <div>
      <h1>Fraud Alerts</h1>

      {alerts.map((alert) => (
        <div
          key={alert.alert_id}
          style={{
            border: "1px solid red",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <p><strong>Alert ID:</strong> {alert.alert_id}</p>
          <p><strong>Account ID:</strong> {alert.account_id}</p>
          <p><strong>Amount:</strong> R {alert.amount}</p>
          <p><strong>Date:</strong> {alert.date}</p>
          <p><strong>Status:</strong> {alert.status}</p>
        </div>
      ))}
    </div>
  );
}

export default FraudAlerts;