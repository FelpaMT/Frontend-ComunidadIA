import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import StatusMessage from "../components/StatusMessage";

export default function Subscriptions() {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSubs() {
      setLoading(true);
      setStatus({ type: "info", message: "" });
      try {
        const [resFollowers, resFollowing] = await Promise.all([
          api.get("/api/subscription/me/followers", {
            params: { limit: 50, offset: 0 },
          }),
          api.get("/api/subscription/me/following", {
            params: { limit: 50, offset: 0 },
          }),
        ]);
        setFollowers(resFollowers.data || []);
        setFollowing(resFollowing.data || []);
      } catch {
        setStatus({
          type: "error",
          message: "Error cargando tus suscripciones.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSubs();
  }, []);

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <div className="card">
        <h2 className="page-title">Suscripciones</h2>
        <p className="page-subtitle">
          Mira quién te sigue y a quién estás siguiendo en ComunidadIA.
        </p>
        <StatusMessage type={status.type} message={status.message} />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="page-title" style={{ fontSize: "1.1rem" }}>
            Usuarios que me siguen
          </h3>
          {loading ? (
            <div>Cargando...</div>
          ) : followers.length === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
              Aún no tienes seguidores.
            </div>
          ) : (
            <div className="grid" style={{ gap: "0.6rem" }}>
              {followers.map((u) => (
                <div
                  key={u.id}
                  className="card"
                  style={{ padding: "0.75rem", cursor: "pointer" }}
                  onClick={() => navigate(`/users/${u.id}`)}
                >
                  <div style={{ fontWeight: 500 }}>{u.nick_name}</div>
                  <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                    {u.user.name} · {u.user.email}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="page-title" style={{ fontSize: "1.1rem" }}>
            Usuarios que sigo
          </h3>
          {loading ? (
            <div>Cargando...</div>
          ) : following.length === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
              Aún no sigues a nadie.
            </div>
          ) : (
            <div className="grid" style={{ gap: "0.6rem" }}>
              {following.map((u) => (
                <div
                  key={u.id}
                  className="card"
                  style={{ padding: "0.75rem", cursor: "pointer" }}
                  onClick={() => navigate(`/users/${u.id}`)}
                >
                  <div style={{ fontWeight: 500 }}>{u.nick_name}</div>
                  <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                    {u.user.name} · {u.user.email}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
