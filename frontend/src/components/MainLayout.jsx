import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { refreshSessionUser } from "../services/session";

function MainLayout() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const validateSession = async () => {
      setError("");
      try {
        // Also repairs old/incomplete browser sessions missing customer_id.
        const profile = await refreshSessionUser();
        if (!cancelled) setUser(profile);
      } catch (err) {
        if (!cancelled) {
          setUser(null);
          setError(err.response?.data?.message || err.message ||
            "We couldn't load your session. Please try again.");
        }
      }
    };
    validateSession();
    return () => { cancelled = true; };
  }, [retry]);

  // Do not mount account/transaction screens until identity is confirmed.
  if (!user) {
    return (
      <div className="page-container">
        <div className="form-card" role="status">
          <h2>🏦 LAMA Bank</h2>
          {error ? (
            <>
              <p className="error-message">{error}</p>
              <button className="primary-btn" type="button"
                onClick={() => setRetry((value) => value + 1)}>
                Retry connection
              </button>
              <p>If your session has expired, sign in again.</p>
            </>
          ) : <p>Checking your secure session...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Navbar user={user} />
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
