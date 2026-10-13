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

    if (!username.trim() || !password.trim()) {
      setMessage("Please enter both your username and password.");
      return;
    }

    try {
      const response = await API.post("/login", {
        username,
        password,
      });


      if (response.data.status === "success") {
        if (!response.data.token) throw new Error("Login session was not returned.");
        sessionStorage.setItem("lama_token", response.data.token);
        const { token, ...user } = response.data;
        sessionStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("user"); // clear old insecure login state
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