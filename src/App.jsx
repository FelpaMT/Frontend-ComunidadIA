import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Inicio from "./pages/Inicio";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
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

/* ============================================
   Redirección según autenticación
   ============================================ */
function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/home" : "/inicio"} replace />;
}

/* ============================================
   LAYOUT AL ESTILO NEWSBREAK
   ============================================ */
function LayoutWithNav({ children }) {
  const location = useLocation();

  // Rutas donde no deben mostrarse navbar y sidebar
  const hiddenRoutes = ["/inicio", "/signin", "/signup"];

  const hideNav = hiddenRoutes.includes(location.pathname);
  const hideSidebar = hiddenRoutes.includes(location.pathname);

  return (
    <div className="app-shell">
      {/* NAVBAR */}
      {!hideNav && <Navbar />}

      <div className="newsbreak-shell">
        <div className="newsbreak-container">

          {/* MAIN CONTENT */}
          <main className="newsbreak-main">
            {children}
          </main>

          {/* SIDEBAR (oculto en inicio/signin/signup) */}
          {!hideSidebar && (
            <aside className="newsbreak-sidebar">
              <SidebarMyFollowers />
              <SidebarMyPublications />
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}


/* ============================================
   APP PRINCIPAL (NO TOCADA)
   ============================================ */
export default function App() {
  return (
    <LayoutWithNav>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/publications"
          element={
            <ProtectedRoute>
              <Publications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/publications/:id"
          element={
            <ProtectedRoute>
              <PublicationDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <UserDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-publication"
          element={
            <ProtectedRoute>
              <CreatePublication />
            </ProtectedRoute>
          }
        />

        <Route
          path="/publications/:id/edit"
          element={
            <ProtectedRoute>
              <EditPublication />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </LayoutWithNav>
  );
}
