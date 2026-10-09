import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const Inicio = lazy(() => import("./pages/Inicio"));
const Signin = lazy(() => import("./pages/Signin"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Home = lazy(() => import("./pages/Home"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const EducatorsDirectoryView = lazy(() => import("./pages/EducatorsDirectoryView"));
const EducatorProfileView = lazy(() => import("./pages/EducatorProfileView"));
const EditProfileView = lazy(() => import("./pages/EditProfileView"));
const PublicationsFeedView = lazy(() => import("./pages/PublicationsFeedView"));
const PublicationDetailView = lazy(() => import("./pages/PublicationDetailView"));
const PublicationEditorView = lazy(() => import("./pages/PublicationEditorView"));

import SidebarMyFollowers from "./components/SidebarMyFollowers";
import SidebarMyPublications from "./components/SidebarMyPublications";
import ChatBot from "./components/ChatBot";

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
      <div className="min-h-screen bg-mariner-50 dark:bg-zinc-950 text-mariner-900 dark:text-zinc-100 font-sans transition-colors duration-200">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mariner-50 dark:bg-zinc-950 text-mariner-900 dark:text-zinc-100 font-sans transition-colors duration-200">
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
    <>
      <LayoutWithNav>
        <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/inicio" element={<PublicRoute><Inicio /></PublicRoute>} />
          <Route path="/signin" element={<PublicRoute><Signin /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Rutas Protegidas */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><EducatorsDirectoryView /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute><EducatorProfileView /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><EducatorProfileView /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfileView /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
          
          {/* Fase 3: Publicaciones, Editor y Detalle */}
          <Route path="/publications" element={<ProtectedRoute><PublicationsFeedView /></ProtectedRoute>} />
          <Route path="/publications/:id" element={<ProtectedRoute><PublicationDetailView /></ProtectedRoute>} />
          <Route path="/create-publication" element={<ProtectedRoute><PublicationEditorView /></ProtectedRoute>} />
          <Route path="/publications/:id/edit" element={<ProtectedRoute><PublicationEditorView /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Suspense>
      </LayoutWithNav>
      <ChatBot />
    </>
  );
}
