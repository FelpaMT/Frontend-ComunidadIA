import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "2rem" }}>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
}
