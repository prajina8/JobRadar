import React from "react";

import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand"><BriefcaseBusiness size={22}/> SmartJob</Link>
      <nav>
        <Link to="/jobs">Jobs</Link>
        {user?.role === "applicant" && <Link to="/recommendations">Recommended</Link>}
        {user?.role === "applicant" && <Link to="/applications">Applications</Link>}
        {user?.role === "recruiter" && <Link to="/recruiter">Recruiter</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
      </nav>
      <div className="nav-actions">
        {user ? (
          <>
            <Link to="/profile"><UserCircle size={18}/> {user.name}</Link>
            <button className="ghost" onClick={() => { logout(); navigate("/"); }}><LogOut size={17}/> Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link className="btn small" to="/register">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
