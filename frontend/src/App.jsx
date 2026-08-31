import React from "react";

import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Applications from "./pages/Applications.jsx";
import Recruiter from "./pages/Recruiter.jsx";
import Admin from "./pages/Admin.jsx";

function Protected({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return <>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/jobs" element={<Jobs/>}/>
      <Route path="/jobs/:id" element={<JobDetails/>}/>
      <Route path="/profile" element={<Protected><Profile/></Protected>}/>
      <Route path="/recommendations" element={<Protected roles={["applicant"]}><Recommendations/></Protected>}/>
      <Route path="/applications" element={<Protected roles={["applicant"]}><Applications/></Protected>}/>
      <Route path="/recruiter" element={<Protected roles={["recruiter"]}><Recruiter/></Protected>}/>
      <Route path="/admin" element={<Protected roles={["admin"]}><Admin/></Protected>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </>;
}
