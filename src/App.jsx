import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Inicio from "./pages/Inicio";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Subscriptions from "./pages/Subscriptions";
import Publications from "./pages/Publications";
import PublicationDetail from "./pages/PublicationDetail";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import CreatePublication from "./pages/CreatePublication";
import EditPublication from "./pages/EditPublication";
import SidebarMyFollowers from "./components/SidebarMyFollowers";
import SidebarMyPublications from "./components/SidebarMyPublications";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/home" : "/inicio"} replace />;
}

function LayoutWithNav({ children }) {
  const location = useLocation();
  const hiddenRoutes = [
    "/inicio",
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];
  const isHidden = hiddenRoutes.includes(location.pathname);

  if (isHidden) {
    return (
      <div className="min-h-screen bg-mariner-50 dark:bg-zinc-950 font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mariner-50 dark:bg-zinc-950 font-sans">
      <Navbar />
      <div className="pb-10 pt-5">
        <div className="max-w-5xl mx-auto px-4 flex gap-6 items-start">
          <main className="flex-1 min-w-0 flex flex-col gap-4">
            {children}
          </main>
          <aside className="hidden lg:flex w-72 flex-none flex-col gap-4 sticky top-20">
            <SidebarMyFollowers />
            <SidebarMyPublications />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LayoutWithNav>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/publications" element={<ProtectedRoute><Publications /></ProtectedRoute>} />
        <Route path="/publications/:id" element={<ProtectedRoute><PublicationDetail /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
        <Route path="/create-publication" element={<ProtectedRoute><CreatePublication /></ProtectedRoute>} />
        <Route path="/publications/:id/edit" element={<ProtectedRoute><EditPublication /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </LayoutWithNav>
  );
}
