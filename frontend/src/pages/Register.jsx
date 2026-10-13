import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/forms.css";

function Register() {
  const navigate = useNavigate();
  const redirectTimer = useRef(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => () => {
    if (redirectTimer.current) clearTimeout(redirectTimer.current);
  }, []);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setMessage("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await API.post("/register", {
        ...form,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        username: form.username.trim(),
      });

      if (response.data.status === "success") {
        setIsError(false);
        setMessage("Account created successfully! Redirecting you to login...");
        redirectTimer.current = setTimeout(() => navigate("/login", { replace: true }), 1300);
      } else {
        setIsError(true);
        setMessage(response.data.message || "We couldn't create your account. Please try again.");
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Registration couldn't be completed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container register-page">
      <div className="form-card register-card">
        <button
          type="button"
          className="register-back"
          onClick={() => navigate("/login")}
        >
          <span aria-hidden="true">←</span> Back to Login
        </button>

        <div className="register-heading">
          <h1>🏦 LAMA Bank</h1>
          <h2>Create Account</h2>
          <p>Join our banking simulation. Create a profile to get started.</p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="register-full-name">Full Name</label>
            <input id="register-full-name" name="full_name" type="text"
              value={form.full_name} onChange={handleChange}
              autoComplete="name" placeholder="Enter your full name"
              maxLength={50} required />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email Address</label>
            <input id="register-email" name="email" type="email"
              value={form.email} onChange={handleChange}
              autoComplete="email" placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label htmlFor="register-phone">Phone Number</label>
            <input id="register-phone" name="phone" type="tel"
              value={form.phone} onChange={handleChange}
              autoComplete="tel" placeholder="Enter your phone number"
              maxLength={10} required />
          </div>

          <div className="form-group">
            <label htmlFor="register-username">Username</label>
            <input id="register-username" name="username" type="text"
              value={form.username} onChange={handleChange}
              autoComplete="username" placeholder="Choose a username"
              maxLength={50} required />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input id="register-password" name="password" type="password"
              value={form.password} onChange={handleChange}
              autoComplete="new-password" placeholder="At least 10 characters"
              minLength={10} maxLength={128} required />
            <small className="register-hint">Use at least 10 characters for your password.</small>
          </div>

          <button className="primary-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {message && (
          <p className={isError ? "error-message" : "success-message"}
             role={isError ? "alert" : "status"}>
            {message}
          </p>
        )}

        <div className="register-footer">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

export default Register;
