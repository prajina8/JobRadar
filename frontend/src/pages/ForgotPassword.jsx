import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import ResetPassword from "./ResetPassword.jsx";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message || "If that email is registered, a reset code has been sent.");
      setTimeout(() => navigate("/reset-password", { state: { email } }), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">SmartJob</span>
        <h1>Forgot your password?</h1>
        <p>Enter your account email and we'll send a 6-digit code to reset it.</p>
        <form onSubmit={submit}>
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <button className="btn full" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset code"}
          </button>
          <p className="center muted">
            Already have a code? <Link to="/reset-password" state={{ email }}>Enter it here</Link>
          </p>
          <p className="center muted">
            Remembered your password? <Link to="/login">Back to login</Link>
          </p>
        </form>
      </div>
    </main>
  );
}