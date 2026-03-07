import React from "react";

export default function UserCard({
  user,
  onDetail,
  onToggleFollow,
  loadingFollow,
}) {
  return (
    <div className="card" style={{ padding: "1rem" }}>
      <h3 style={{ marginBottom: "0.3rem" }}>{user.nick_name}</h3>
      <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
        {user.user.name} · {user.user.email}
      </div>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <button className="btn btn-outline" onClick={onDetail}>
          Detalle
        </button>
        <button
          className="btn btn-primary"
          disabled={loadingFollow}
          onClick={onToggleFollow}
        >
          {user.followed_by_me ? "Siguiendo" : "Seguir"}
        </button>
      </div>
    </div>
  );
}
