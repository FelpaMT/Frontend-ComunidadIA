import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import StatusMessage from "../components/StatusMessage";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [educator, setEducator] = useState(null);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  async function fetchEducator() {
    setLoading(true);
    try {
      const res = await api.get(`/api/educators/${id}`);
      setEducator(res.data);
    } catch {
      setStatus({
        type: "error",
        message: "Error cargando el usuario.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEducator();
  }, [id]);

  async function handleToggleFollow() {
    if (!educator) return;
    setFollowLoading(true);
    try {
      if (educator.followed_by_me) {
        await api.post(`/api/subscription/unfollow/${educator.id}`);
        setStatus({
          type: "success",
          message: `Dejaste de seguir a ${educator.nick_name}.`,
        });
        setEducator((prev) => ({ ...prev, followed_by_me: false }));
      } else {
        await api.post(`/api/subscription/follow/${educator.id}`);
        setStatus({
          type: "success",
          message: `Ahora sigues a ${educator.nick_name}.`,
        });
        setEducator((prev) => ({ ...prev, followed_by_me: true }));
      }
    } catch {
      setStatus({
        type: "error",
        message: "Error al actualizar la suscripción.",
      });
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) return <div>Cargando...</div>;
  if (!educator) return <div>No se encontró este usuario.</div>;

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <div className="card">
        <StatusMessage type={status.type} message={status.message} />
        <h2 className="page-title">{educator.nick_name}</h2>
        <p className="page-subtitle">
          {educator.user.name} · {educator.user.email}
        </p>
        <div style={{ fontSize: "0.85rem", marginBottom: "0.6rem" }}>
          Te sigue:{" "}
          <strong>{educator.following_me ? "Sí" : "No"}</strong>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleToggleFollow}
          disabled={followLoading}
        >
          {educator.followed_by_me ? "Siguiendo" : "Seguir"}
        </button>
      </div>

      <div className="card">
        <h3 className="page-title" style={{ fontSize: "1.2rem" }}>
          Publicaciones de {educator.nick_name}
        </h3>
        {educator.publications?.length === 0 ? (
          <div style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
            Este usuario aún no tiene publicaciones.
          </div>
        ) : (
          <div className="grid" style={{ gap: "0.8rem" }}>
            {educator.publications.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: "0.8rem",
                  cursor: "pointer",
                  background: "rgba(15,23,42,0.7)",
                }}
                onClick={() => navigate(`/publications/${p.id}`)}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    marginBottom: 4,
                  }}
                >
                  {new Date(p.created_at).toLocaleDateString()}
                </div>
                <div>{p.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
