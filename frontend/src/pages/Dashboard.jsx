import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [account, setAccount] = useState(null);

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      const response = await API.get(
        `/accounts/${user.customer_id}`
      );

      if (response.data.length > 0) {
        setAccount(response.data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <h3>Welcome {user?.full_name}</h3>

      <p>Username: {user?.username}</p>

      <p>Customer ID: {user?.customer_id}</p>

      <hr />

      <h2>Account Information</h2>

      <p>
        Account ID: {account?.account_id}
      </p>

      <p>
        Balance: R {account?.balance}
      </p>

      <p>
        Status: {account?.status}
      </p>
    </div>
  );
}

export default Dashboard;