import React from "react";
import { useNavigate } from "react-router-dom";

export default function Inicio() {
  const navigate = useNavigate();

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
      <div
        className="card"
        style={{
          maxWidth: 700,
          textAlign: "center",
          padding: "2.5rem 2rem",
        }}
      >
        <div>
            <img
                src="/logo.png"
                alt="ComunidadIA"
                className="logo-start-page"
            />
        </div>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          ComunidadIA
        </h1>
        <p className="page-subtitle" style={{ marginBottom: "1.5rem" }}>
          Una comunidad de docentes que comparten experiencias, guías y
          recursos sobre cómo usar Inteligencia Artificial en la educación.
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => navigate("/signin")}
          >
            Iniciar sesión
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/signup")}
          >
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
