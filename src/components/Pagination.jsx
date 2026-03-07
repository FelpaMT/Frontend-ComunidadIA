import React from "react";

export default function Pagination({ page, onChange, disabled }) {
  return (
    <div className="pagination">
      <button
        className="btn btn-outline"
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        ◀ Anterior
      </button>
      <span style={{ alignSelf: "center", fontSize: "0.85rem" }}>
        Página {page}
      </span>
      <button
        className="btn btn-outline"
        onClick={() => onChange(page + 1)}
        disabled={disabled}
      >
        Siguiente ▶
      </button>
    </div>
  );
}
