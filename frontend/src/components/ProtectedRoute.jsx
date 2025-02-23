import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthProvider from "../context/AuthProvider";

const ProtectedRoute = () => {
  const { auth } = useContext(AuthProvider);

  return auth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
