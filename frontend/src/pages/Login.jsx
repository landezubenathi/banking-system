import { useRef, useState } from "react";
import API from "../services/api";
import { refreshSessionUser } from "../services/session";
import { useNavigate } from "react-router-dom";

import "../styles/forms.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting.current) return; // prevent two overlapping login attempts
    if (!username.trim() || !password.trim()) {
      setMessage("Please enter both your username and password.");
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setMessage("");
    let issuedToken = null;

    try {
      const response = await API.post("/login", { username, password });
      if (response.data?.status !== "success") {
        setMessage(response.data?.message || "Unable to sign in.");
        return;
      }
      if (!response.data.token) {
        throw new Error("Login session was not returned.");
      }

      issuedToken = response.data.token;
      sessionStorage.setItem("lama_token", issuedToken);
      localStorage.removeItem("user");
      await refreshSessionUser();
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // Do not erase a newer session when an older attempt finishes late.
      // A temporary 502/503 is not proof that the issued token is invalid.
      if (issuedToken &&
          sessionStorage.getItem("lama_token") === issuedToken &&
          error.response?.status === 401) {
        sessionStorage.removeItem("lama_token");
        sessionStorage.removeItem("user");
      }

      const fromMe = String(error.config?.url || "").includes("/me");
      if (fromMe && error.response?.status === 401) {
        setMessage("Login succeeded, but session verification was rejected (401). Check the /me Authorization header and Render logs.");
      } else {
        setMessage(error.response?.data?.message || error.message ||
          "Unable to sign in right now. Please try again.");
      }
      console.error("Login verification failed (status):", error.response?.status || "network error");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">

      <div className="form-card">

        <h1>🏦 LAMA Bank</h1>

          <form onSubmit={handleLogin}>

              <div className="form-group">
                <label>Username</label>

                {/*<input
                    type="text"
                    value={username} 
                    onChange={(e)=>setUsername(e.target.value)}
                />*/}
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                      setUsername(e.target.value);
                      setMessage("");
                  }}
                />
              </div>

              <div className="form-group">

                <label>Password</label>

                <input
                  type="password"
                  value={password}
                  onChange={(e)=>{
                    setPassword(e.target.value);
                    setMessage("");
                  }}
                />

              </div>

              <button className="primary-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Login"}
              </button>

              <p>
                Don't have an account?
                <button className="register-btn"
                type="button"
              onClick={()=>navigate("/register")}
                >
                Register
                </button>

                </p>

          </form>

          {message && (
            <div className="error-message">
                {message}
            </div>
          )}

      </div>

    </div>
  );
}

export default Login;