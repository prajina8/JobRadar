import React,{ useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "applicant" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must contain at least 6 characters.");
    try {
      const user = await register(form);
      navigate(user.role === "recruiter" ? "/recruiter" : "/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return <main className="auth-page"><div className="auth-card">
    <span className="eyebrow">Join SmartJob</span><h1>Create account</h1><p>Build a profile and discover better opportunities.</p>
    <form onSubmit={submit}>
      {error && <div className="error">{error}</div>}
      <label>Full name<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})}/></label>
      <label>Email<input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})}/></label>
      <label>Password<input type="password" minLength="6" required value={form.password} onChange={e => setForm({...form,password:e.target.value})}/></label>
      <label>Account type<select value={form.role} onChange={e => setForm({...form,role:e.target.value})}><option value="applicant">Applicant</option><option value="recruiter">Recruiter</option></select></label>
      <button className="btn full">Create account</button>
      <p className="center muted">Already registered? <Link to="/login">Login</Link></p>
    </form>
  </div></main>;
}
