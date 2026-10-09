import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Mail, CheckCircle2, RotateCw } from "lucide-react";
import api, { setAccessToken } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/StatusMessage";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const urlEmail = searchParams.get("email") || "";
  const urlToken = searchParams.get("token") || "";

  const [email, setEmail] = useState(urlEmail);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  const navigate = useNavigate();

  // Si viene con token directo en la URL, verificar automáticamente
  useEffect(() => {
    if (urlToken && urlEmail) {
      handleVerifyDirect(urlEmail, urlToken);
    }
  }, [urlToken, urlEmail]);

  async function handleVerifyDirect(eMail, tkn) {
    setLoading(true);
    setStatus({ type: "info", message: "Verificando cuenta..." });
    try {
      const res = await api.post("/api/auth/verify-email", {
        email: eMail,
        token: tkn,
      });
      completeVerification(res.data);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.detail || "Enlace de verificación inválido o expirado.",
      });
      setLoading(false);
    }
  }

  function completeVerification(data) {
    if (!data.access_token) {
      setVerified(true);
      setStatus({
        type: "success",
        message: data.detail || "Tu cuenta ya está verificada. Inicia sesión para continuar.",
      });
      setLoading(false);
      return;
    }
    setAccessToken(data.access_token);
    setVerified(true);
    setStatus({
      type: "success",
      message: "¡Tu cuenta ha sido verificada exitosamente!",
    });
    setLoading(false);
    setTimeout(() => {
      navigate("/home");
      window.location.reload();
    }, 1500);
  }

  async function handleCodeSubmit(e) {
    e.preventDefault();
    if (!email || !code) {
      setStatus({ type: "error", message: "Ingresa tu email y el código de 6 dígitos." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "" });

    try {
      const res = await api.post("/api/auth/verify-email", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      completeVerification(res.data);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.detail || "Código de verificación incorrecto o expirado.",
      });
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!email) {
      setStatus({ type: "error", message: "Ingresa tu correo para reenviar el código." });
      return;
    }
    setResending(true);
    try {
      const res = await api.post("/api/auth/resend-verification", {
        email: email.trim().toLowerCase(),
      });
      setStatus({
        type: "success",
        message: res.data?.detail || "Nuevo código enviado a tu correo.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.detail || "Error al reenviar el código.",
      });
    } finally {
      setResending(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 focus:border-transparent text-sm transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-mariner-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <div className="w-12 h-12 bg-mariner-100 dark:bg-zinc-800 text-mariner-600 dark:text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-3">
          <Mail size={24} />
        </div>

        <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 text-center mb-1">
          Verifica tu cuenta
        </h2>
        <p className="text-xs text-mariner-500 dark:text-zinc-400 text-center mb-5">
          Hemos enviado un código de 6 dígitos a tu correo electrónico.
        </p>

        <StatusMessage type={status.type} message={status.message} />

        {verified ? (
          <div className="text-center py-4 space-y-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-xs text-mariner-600 dark:text-zinc-300">
              Redirigiendo a tu espacio de trabajo...
            </p>
          </div>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
                Correo electrónico
              </label>
              <input
                className={inputClass}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
                Código de 6 dígitos
              </label>
              <input
                className={`${inputClass} text-center tracking-widest text-lg font-mono font-bold`}
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || code.length < 6}
              className="w-full py-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Verificando..." : "Confirmar y continuar"}
            </button>

            <div className="flex items-center justify-between pt-3 text-xs">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="flex items-center gap-1 text-mariner-600 dark:text-zinc-400 hover:underline disabled:opacity-50"
              >
                <RotateCw size={12} className={resending ? "animate-spin" : ""} />
                Reenviar código
              </button>

              <Link
                to="/signin"
                className="text-mariner-500 dark:text-zinc-500 hover:underline"
              >
                Iniciar sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
