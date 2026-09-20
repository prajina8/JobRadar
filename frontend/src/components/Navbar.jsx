
import React from "react";

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

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="nav">

      {/* Logo */}
      <Link to="/" className="brand">
        <BriefcaseBusiness size={22} />
        SmartJob
      </Link>

      {/* Navigation */}
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

      {/* Right side */}
      <div className="nav-actions">

        {/* Theme Toggle */}
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
              onClick={handleLogout}
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

    </header>
  );
}

