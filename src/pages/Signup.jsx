import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/StatusMessage";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    nick_name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "info", message: "" });
    setLoading(true);
    try {
      await signup(form);
      setStatus({
        type: "success",
        message: "Registro exitoso. Ahora puedes iniciar sesión.",
      });
      navigate("/signin");
    } catch (err) {
      const code = err.response?.status;
      if (code === 400 || code === 409) {
        setStatus({
          type: "error",
          message: "Datos inválidos o email ya registrado.",
        });
      } else {
        setStatus({
          type: "error",
          message: "Error inesperado al registrarse.",
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
      <div className="card" style={{ maxWidth: 480, width: "100%" }}>
        <h2 className="page-title" style={{ textAlign: "center" }}>
          Crear cuenta
        </h2>
        <p className="page-subtitle" style={{ textAlign: "center" }}>
          Únete como docente EDUCATOR y comparte tus artículos.
        </p>

        <StatusMessage type={status.type} message={status.message} />

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "0.9rem" }}>
          <div>
            <label>Nombre completo</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label>Nick name</label>
            <input
              className="input"
              required
              value={form.nick_name}
              onChange={(e) =>
                setForm({ ...form, nick_name: e.target.value })
              }
            />
          </div>
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
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Creando..." : "Registrarse"}
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
          ¿Ya tienes cuenta?{" "}
          <Link to="/signin" style={{ color: "#3b82f6" }}>
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
