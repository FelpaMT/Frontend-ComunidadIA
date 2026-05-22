import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function SidebarMyPublications() {
  const [pubs, setPubs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/publication/me", { params: { limit: 10, offset: 0 } })
      .then((res) => setPubs(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-mariner-900 dark:text-zinc-100 mb-3">
        Mis publicaciones
      </h3>

      {pubs.length === 0 ? (
        <p className="text-xs text-mariner-400 dark:text-zinc-500">
          Aún no has creado publicaciones.
        </p>
      ) : (
        <ul className="space-y-1">
          {pubs.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-mariner-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors group"
              onClick={() => navigate(`/publications/${p.id}`)}
            >
              <span className="text-xs font-medium text-mariner-700 dark:text-zinc-400 truncate group-hover:text-mariner-600 dark:group-hover:text-mariner-200">
                {p.title}
              </span>
              <span className="text-xs text-mariner-400 dark:text-zinc-500 whitespace-nowrap flex-none">
                {new Date(p.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
