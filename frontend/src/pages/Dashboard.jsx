function Dashboard() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Login successful!</p>

      <h3>
        Welcome {user?.full_name}
      </h3>

      <p>
        Username: {user?.username}
      </p>

      <p>
        Customer ID: {user?.customer_id}
      </p>
    </div>
  );
}

export default Dashboard;