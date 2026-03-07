import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function SidebarMyPublications() {
  const [pubs, setPubs] = useState([]);
  const navigate = useNavigate();

  async function fetchMyPubs() {
    try {
      const res = await api.get("/api/publication/me", {
        params: { limit: 10, offset: 0 },
      });

      setPubs(res.data || []);
    } catch (err) {
      console.error("Error cargando mis publicaciones:", err);
    }
  }

  useEffect(() => {
    fetchMyPubs();
  }, []);

  return (
    <div className="sidebar-card">
      <h3>Mis publicaciones</h3>

      {pubs.length === 0 ? (
        <p style={{ fontSize: "0.9rem", color: "#777" }}>
          Aún no has creado publicaciones.
        </p>
      ) : (
        <ul className="sidebar-list">
          {pubs.map((p) => (
            <li
              key={p.id}
              className="sidebar-item sidebar-item-row"
              onClick={() => navigate(`/publications/${p.id}`)}
            >
              <span className="sidebar-item-title">{p.title}</span>

              <span className="sidebar-item-date">
                {new Date(p.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
