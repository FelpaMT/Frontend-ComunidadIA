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
      setStatus({ type: "success", message: "Login exitoso" });
      navigate("/home");
    } catch (err) {
      const code = err.response?.status;
      if (code === 401 || code === 400) {
        setStatus({
          type: "error",
          message: "Credenciales incorrectas o usuario no válido.",
        });
      } else {
        setStatus({
          type: "error",
          message: "Error inesperado al iniciar sesión.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div className="card" style={{ maxWidth: 420, width: "100%" }}>
        <h2 className="page-title" style={{ textAlign: "center" }}>
          Iniciar sesión
        </h2>
        <p className="page-subtitle" style={{ textAlign: "center" }}>
          Accede a la comunidad de docentes que usan IA.
        </p>

        <StatusMessage type={status.type} message={status.message} />

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "0.9rem" }}>
          <div>
            <label>Email</label>
            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label>Contraseña</label>
            <input
              className="input"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1rem",
            fontSize: "0.85rem",
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          ¿No tienes cuenta?{" "}
          <Link to="/signup" style={{ color: "#3b82f6" }}>
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
