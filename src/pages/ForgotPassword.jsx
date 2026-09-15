import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import api from "../api/client";
import StatusMessage from "../components/StatusMessage";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus({ type: "info", message: "" });

    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      setSubmitted(true);
      setStatus({
        type: "success",
        message: res.data?.detail || "Enlace enviado. Revisa tu correo electrónico.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.detail || "Error al procesar la solicitud.",
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 focus:border-transparent text-sm transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-mariner-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <Link
          to="/signin"
          className="inline-flex items-center gap-1.5 text-xs text-mariner-600 dark:text-zinc-400 hover:underline mb-4"
        >
          <ArrowLeft size={14} /> Volver a iniciar sesión
        </Link>

        <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 text-center mb-1">
          Recuperar contraseña
        </h2>
        <p className="text-xs text-mariner-500 dark:text-zinc-400 text-center mb-5">
          Ingresa tu correo y te enviaremos las instrucciones para restablecerla.
        </p>

        <StatusMessage type={status.type} message={status.message} />

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-xs text-mariner-600 dark:text-zinc-300">
              Si tu correo está registrado, recibirás un enlace válido por 30 minutos.
            </p>
            <Link
              to="/signin"
              className="inline-block w-full py-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Regresar al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  className={inputClass}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="profesor@ejemplo.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
