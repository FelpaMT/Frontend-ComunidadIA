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

  useEffect(() => {
    api
      .get(`/api/educators/${id}`)
      .then((res) => setEducator(res.data))
      .catch(() => setStatus({ type: "error", message: "Error cargando el usuario." }))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleToggleFollow() {
    if (!educator) return;
    setFollowLoading(true);
    try {
      if (educator.followed_by_me) {
        await api.post(`/api/subscription/unfollow/${educator.id}`);
        setStatus({ type: "success", message: `Dejaste de seguir a ${educator.nick_name}.` });
        setEducator((prev) => ({ ...prev, followed_by_me: false }));
      } else {
        await api.post(`/api/subscription/follow/${educator.id}`);
        setStatus({ type: "success", message: `Ahora sigues a ${educator.nick_name}.` });
        setEducator((prev) => ({ ...prev, followed_by_me: true }));
      }
    } catch {
      setStatus({ type: "error", message: "Error al actualizar la suscripción." });
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-8 text-sm text-mariner-400 dark:text-zinc-500">
        Cargando...
      </div>
    );
  }

  if (!educator) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-8">
        <StatusMessage type={status.type} message={status.message} />
        <p className="text-sm text-mariner-500 dark:text-zinc-400">No se encontró este usuario.</p>
      </div>
    );
  }

  const initials = (educator.nick_name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      {/* User header */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <StatusMessage type={status.type} message={status.message} />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-200 flex items-center justify-center text-xl font-bold flex-none">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50">
              {educator.nick_name}
            </h2>
            <p className="text-sm text-mariner-500 dark:text-zinc-400">
              {educator.user.name} · {educator.user.email}
            </p>
            {educator.following_me && (
              <span className="inline-block mt-1 text-xs text-mariner-500 dark:text-zinc-400">
                Te sigue
              </span>
            )}
          </div>
          <button
            onClick={handleToggleFollow}
            disabled={followLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              educator.followed_by_me
                ? "bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-200 hover:bg-mariner-200 dark:hover:bg-zinc-700"
                : "bg-mariner-600 dark:bg-mariner-500 text-white hover:bg-mariner-700 dark:hover:bg-mariner-400"
            }`}
          >
            {educator.followed_by_me ? "Siguiendo" : "Seguir"}
          </button>
        </div>
      </div>

      {/* Publications */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-mariner-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-mariner-900 dark:text-zinc-100">
            Publicaciones de {educator.nick_name}
          </h3>
        </div>

        {!educator.publications?.length ? (
          <p className="text-sm text-mariner-400 dark:text-zinc-500 px-5 py-4">
            Este usuario aún no tiene publicaciones.
          </p>
        ) : (
          <ul className="divide-y divide-mariner-50 dark:divide-zinc-800/50 p-2">
            {educator.publications.map((p) => (
              <li
                key={p.id}
                className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-mariner-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/publications/${p.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-mariner-900 dark:text-zinc-100 line-clamp-2">
                    {p.title}
                  </p>
                  <p className="text-xs text-mariner-400 dark:text-zinc-500 mt-0.5">
                    {new Date(p.created_at).toLocaleDateString()}
                    {p.category && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-mariner-100 dark:bg-zinc-800 text-mariner-600 dark:text-zinc-400">
                        {p.category.name}
                      </span>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
