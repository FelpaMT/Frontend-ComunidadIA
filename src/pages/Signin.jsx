import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/StatusMessage";

export default function Signin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "info", message: "" });
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/home");
    } catch (err) {
      const data = err.response?.data;
      const code = err.response?.status;
      if (code === 403 && data?.requires_verification) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
        return;
      }
      setStatus({
        type: "error",
        message:
          data?.detail ||
          (code === 401 || code === 400
            ? "Credenciales incorrectas o usuario no válido."
            : "Error inesperado al iniciar sesión."),
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
        <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 text-center mb-1">
          Iniciar sesión
        </h2>
        <p className="text-xs text-mariner-500 dark:text-zinc-400 text-center mb-5">
          Accede a la comunidad de docentes que usan IA.
        </p>

        <StatusMessage type={status.type} message={status.message} />

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
              Email
            </label>
            <input
              className={inputClass}
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400">
                Contraseña
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-mariner-600 dark:text-zinc-400 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              className={inputClass}
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-center text-mariner-500 dark:text-zinc-400 mt-5">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="text-mariner-600 dark:text-zinc-400 font-semibold hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
