import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "recruiter" ? "/recruiter" : user.role === "admin" ? "/admin" : "/recommendations");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return <AuthCard title="Welcome back" subtitle="Sign in to continue">
    <form onSubmit={submit}>
      {error && <div className="error">{error}</div>}
      <label>Email<input type="email" required value={form.email} onChange={e => setForm({...form, email:e.target.value})}/></label>
      <label>Password<input type="password" required value={form.password} onChange={e => setForm({...form, password:e.target.value})}/></label>
      <button className="btn full">Login</button>
      <button type="button" className="google-btn" disabled>Continue with Google <small></small></button>
      <p className="center muted">New here? <Link to="/register">Create an account</Link></p>
    </form>
  </AuthCard>;
}

function AuthCard({ title, subtitle, children }) {
  return <main className="auth-page"><div className="auth-card"><span className="eyebrow">SmartJob</span><h1>{title}</h1><p>{subtitle}</p>{children}</div></main>;
}
