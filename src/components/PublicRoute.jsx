import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mariner-50 dark:bg-zinc-950 text-mariner-800 dark:text-zinc-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mariner-600 dark:border-mariner-400"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
