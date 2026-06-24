/*import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/login", {
        username,
        password
      });

      if (response.data.status === "success") {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data)
        );

        navigate("/dashboard");
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Login failed");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Banking System Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <br /><br />

        <button type="submit">
          Login
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Login;*/

///////////////

import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

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
        //localStorage.setItem("user", JSON.stringify(response.data));
        //setMessage("Login Successful");
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
    <div>
      <h1>Banking System Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button type="submit">
          Login
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Login;