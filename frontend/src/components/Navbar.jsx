
import React, { useState } from "react";

import {
  BriefcaseBusiness,
  LogOut,
  UserCircle,
  Moon,
  Sun,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import {resolveAvatarUrl} from "../utils/asset.js";

export default function Navbar() {
  const { user, logout } = useAuth();

  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
const [loggingOut, setLoggingOut] = useState(false);

async function handleLogout() {
  setLoggingOut(true);

  try {
    await logout();
    navigate("/");
  } finally {
    setLoggingOut(false);
    setShowLogoutConfirm(false);
  }
}

  return (
    <header className="nav">

    
      <Link to="/" className="brand">
        <BriefcaseBusiness size={22} />
        SmartJob
      </Link>

      <nav>
        <Link to="/jobs">
          Jobs
        </Link>

        {user?.role === "applicant" && (
          <Link to="/recommendations">
            Recommended
          </Link>
        )}

        {user?.role === "applicant" && (
          <Link to="/applications">
            Applications
          </Link>
        )}

        {user?.role === "recruiter" && (
          <Link to="/recruiter">
            Recruiter
          </Link>
        )}

        {user?.role === "admin" && (
          <Link to="/admin">
            Admin
          </Link>
        )}
      </nav>

      
      <div className="nav-actions">

       
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={
            theme === "light"
              ? "Switch to dark mode"
              : "Switch to light mode"
          }
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}
        </button>

        {user ? (
          <>
             <Link to="/profile">
              {user.avatar
                ? <img className="nav-avatar" src={resolveAvatarUrl(user.avatar)} alt="" />
                : <UserCircle size={18} />}
              {user.name}
            </Link>

           <button
  className="ghost"
  onClick={() => setShowLogoutConfirm(true)}
  disabled={loggingOut}
>
  <LogOut size={17} />
  Logout
</button>
          </>
        ) : (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link
              className="btn small"
              to="/register"
            >
              Register
            </Link>
          </>
        )}

      </div>

{showLogoutConfirm && (
  <div className="modal-overlay">
    <div className="confirm-modal">
      <div className="confirm-icon">
        <LogOut size={24} />
      </div>

      <h2>Do you want to logout?</h2>

      <p>
        You will be signed out of your SmartJob account.
      </p>

      <div className="confirm-actions">
        <button
          className="ghost"
          onClick={() => setShowLogoutConfirm(false)}
          disabled={loggingOut}
        >
          Cancel
        </button>

        <button
          className="btn danger-btn"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <>
              <span className="spinner" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut size={16} />
              Logout
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </header>
  );
}

