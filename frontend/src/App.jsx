import { Navigate, Route, Routes } from "react-router-dom";

function Protected({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return <>
    <Navbar/>
   
      
  </>;
}
