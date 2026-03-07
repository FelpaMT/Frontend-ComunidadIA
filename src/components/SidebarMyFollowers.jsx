import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function SidebarMyFollowers() {
  const [followers, setFollowers] = useState([]);
  const navigate = useNavigate();

  async function fetchFollowers() {
    try {
      const res = await api.get("/api/subscription/me/followers", {
        params: { limit: 20, offset: 0 },
      });

      setFollowers(res.data || []);
    } catch (err) {
      console.error("Error cargando seguidores:", err);
    }
  }

  useEffect(() => {
    fetchFollowers();
  }, []);

  return (
    <div className="sidebar-card">
      <h3>Mis seguidores</h3>

      {followers.length === 0 ? (
        <p style={{ fontSize: "0.9rem", color: "#777" }}>
          Aún no tienes seguidores.
        </p>
      ) : (
        <ul className="sidebar-list">
          {followers.map((f) => (
            <li
              key={f.user.id}
              className="sidebar-item"
              onClick={() => navigate(`/users/${f.user.id}`)}
            >
              <strong>{f.user.nick_name}</strong>
              <span className="sidebar-meta">{f.user.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
