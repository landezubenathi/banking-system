import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

import "../styles/forms.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/login", {
        username,
        password,
      });

      console.log(response.data);

      if (response.data.status === "success") {
        localStorage.setItem("user", JSON.stringify(response.data));
        //Redirect to Dashboard
        navigate("/dashboard");
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Login Failed");
    }
  };

  return (
    <div className="page-container">

      <div className="form-card">

        <h1>🏦 LAMA Bank</h1>

          <form onSubmit={handleLogin}>

              <div className="form-group">
                <label>Username</label>

                <input
                    type="text"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">

                <label>Password</label>

                <input
                  type="password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                />

              </div>

              <button className="primary-btn">
                Login
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