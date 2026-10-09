import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/StatusMessage";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", nick_name: "", email: "", password: "" });
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(false);

  function getSignupError(err) {
    const data = err.response?.data;
    if (typeof data?.detail === "string") return data.detail;

    const fieldLabels = {
      name: "Nombre",
      nick_name: "Nombre de usuario",
      email: "Correo electrónico",
      password: "Contraseña",
      role: "Tipo de cuenta",
    };
    const issues = Object.entries(data || {}).flatMap(([field, messages]) => {
      const label = fieldLabels[field] || field;
      const text = (Array.isArray(messages) ? messages : [messages])
        .filter((message) => typeof message === "string")
        .join(" ");
      return text ? [`${label}: ${text}`] : [];
    });

    if (issues.length) return issues.join(" ");
    if (err.response?.status === 400 || err.response?.status === 409) {
      return "Revisa los datos ingresados. El correo y el nombre de usuario deben ser únicos; la contraseña debe tener al menos 12 caracteres y cumplir los requisitos de seguridad.";
    }
    return "No se pudo crear la cuenta. Comprueba tu conexión e inténtalo de nuevo.";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "info", message: "" });
    setLoading(true);
    try {
      await signup(form);
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setStatus({
        type: "error",
        message: getSignupError(err),
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 focus:border-transparent text-sm transition-colors";

  const fields = [
    { key: "name", label: "Nombre completo", type: "text", placeholder: "Tu nombre" },
    { key: "nick_name", label: "Nick name", type: "text", placeholder: "apodo único" },
    { key: "email", label: "Email", type: "email", placeholder: "tu@email.com" },
    { key: "password", label: "Contraseña", type: "password", placeholder: "••••••••" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-mariner-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 text-center mb-1">
          Crear cuenta
        </h2>
        <p className="text-xs text-mariner-500 dark:text-zinc-400 text-center mb-5">
          Únete como docente y comparte tus artículos.
        </p>

        <StatusMessage type={status.type} message={status.message} />

        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
                {label}
              </label>
              <input
                className={inputClass}
                type={type}
                minLength={key === "password" ? 12 : undefined}
                autoComplete={
                  key === "name" ? "name" :
                  key === "nick_name" ? "nickname" :
                  key === "email" ? "email" :
                  key === "password" ? "new-password" : undefined
                }
                required
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
              {key === "password" && (
                <p className="mt-1 text-[11px] text-mariner-500 dark:text-zinc-400">
                  Usa al menos 12 caracteres y evita datos personales o contraseñas comunes.
                </p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Creando..." : "Registrarse"}
          </button>
        </form>

        <p className="text-xs text-center text-mariner-500 dark:text-zinc-400 mt-5">
          ¿Ya tienes cuenta?{" "}
          <Link to="/signin" className="text-mariner-600 dark:text-zinc-400 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
