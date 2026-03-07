import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import PublicationCard from "../components/PublicationCard";
import StatusMessage from "../components/StatusMessage";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setStatus({ type: "info", message: "" });

      try {
        const resFollowing = await api.get("/api/subscription/me/following", {
          params: { limit: 50, offset: 0 },
        });

        const following = resFollowing.data || [];
        const allPubs = [];

        for (const follower of following) {
          const resPubs = await api.get(
            `/api/publication/by-user/${follower.user.id}`,
            { params: { limit: 10, offset: 0 } }
          );
          (resPubs.data || []).forEach((p) => allPubs.push(p));
        }

        allPubs.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setPublications(allPubs);
      } catch (err) {
        const code = err.response?.status;
        if (code === 401) {
          setStatus({
            type: "error",
            message:
              "Tu sesión ha expirado. Vuelve a iniciar sesión si el contenido no carga.",
          });
        } else {
          setStatus({
            type: "error",
            message: "Error cargando publicaciones de tus suscripciones.",
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="newsfeed">

      {/* =============================== */}
      {/* SECCIÓN DE BIENVENIDA */}
      {/* =============================== */}
      <section className="newsfeed-section">
        <h1 className="newsfeed-title">
          Hola, {user?.nick_name || user?.name || "docente"} 👋
        </h1>

        <p className="newsfeed-subtitle">
          Explora artículos sobre IA en educación, sigue a otros docentes y
          comparte tus propias experiencias.
        </p>

        <div className="newsfeed-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/profile")}
          >
            Mi perfil
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/subscriptions")}
          >
            Suscripciones
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/create-publication")}
          >
            Crear publicación
          </button>
        </div>
      </section>

      {/* =============================== */}
      {/* FEED PRINCIPAL DE PUBLICACIONES */}
      {/* =============================== */}
      <section className="newsfeed-section">
        <h2 className="newsfeed-subtitle-section">
          Publicaciones de docentes que sigues
        </h2>

        <StatusMessage type={status.type} message={status.message} />

        {loading ? (
          <div className="newsfeed-loading">Cargando publicaciones...</div>
        ) : publications.length === 0 ? (
          <div className="newsfeed-empty">
            Aún no hay publicaciones de docentes que sigues.
          </div>
        ) : (
          <div className="newsfeed-list">
            {publications.map((p) => (
              <PublicationCard
                key={p.id}
                publication={p}
                onClick={() => navigate(`/publications/${p.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
