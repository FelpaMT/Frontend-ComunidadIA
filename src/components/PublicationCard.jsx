import React from "react";

export default function PublicationCard({ publication, onClick }) {
  const created = new Date(publication.created_at);
  return (
    <div
      className="card"
      style={{ padding: "1rem", cursor: "pointer" }}
      onClick={onClick}
    >
      <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
        {created.toLocaleDateString()} · {publication.writer.nick_name}
      </div>
      <h3 style={{ marginTop: "0.4rem", fontSize: "1.05rem" }}>
        {publication.title}
      </h3>
    </div>
  );
}
