import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("smartjob_user");
    return raw ? JSON.parse(raw) : null;
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("smartjob_token", data.token);
    localStorage.setItem("smartjob_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("smartjob_token", data.token);
    localStorage.setItem("smartjob_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }
  function logout() {
    localStorage.removeItem("smartjob_token");
    localStorage.removeItem("smartjob_user");
    setUser(null);
  }

 
  function updateUser(patch) {
    setUser((current) => {
      const next = { ...(current || {}), ...patch };
      localStorage.setItem("smartjob_user", JSON.stringify(next));
      return next;
    });
  }

  const value = useMemo(() => ({ user, login, register, logout, updateUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
