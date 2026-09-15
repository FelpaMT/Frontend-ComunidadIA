import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import api from "../api/client";
import StatusMessage from "../components/StatusMessage";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setStatus({ type: "error", message: "Token de recuperación no válido o ausente." });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: "error", message: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "Las contraseñas no coinciden." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "" });

    try {
      const res = await api.post("/api/auth/reset-password", {
        token,
        new_password: newPassword,
      });
      setSuccess(true);
      setStatus({
        type: "success",
        message: res.data?.detail || "Contraseña restablecida con éxito.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.detail || "Error al restablecer la contraseña. El enlace puede haber expirado.",
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 focus:border-transparent text-sm transition-colors";

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-mariner-50 dark:bg-zinc-950">
        <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
          <p className="text-sm text-red-500 mb-4">
            Enlace de recuperación inválido o incompleto.
          </p>
          <Link
            to="/forgot-password"
            className="text-xs text-mariner-600 dark:text-zinc-400 hover:underline"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-mariner-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 text-center mb-1">
          Nueva contraseña
        </h2>
        <p className="text-xs text-mariner-500 dark:text-zinc-400 text-center mb-5">
          Ingresa tu nueva contraseña para acceder a ComunidadIA.
        </p>

        <StatusMessage type={status.type} message={status.message} />

        {success ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-xs text-mariner-600 dark:text-zinc-300">
              ¡Tu contraseña ha sido actualizada exitosamente!
            </p>
            <button
              onClick={() => navigate("/signin")}
              className="w-full py-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Iniciar sesión ahora
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
                Nueva contraseña
              </label>
              <input
                className={inputClass}
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                className={inputClass}
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
