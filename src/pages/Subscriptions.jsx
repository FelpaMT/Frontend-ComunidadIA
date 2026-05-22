import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
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
      try {
        const [resFollowers, resFollowing] = await Promise.all([
          api.get("/api/subscription/me/followers", { params: { limit: 50, offset: 0 } }),
          api.get("/api/subscription/me/following", { params: { limit: 50, offset: 0 } }),
        ]);
        setFollowers(resFollowers.data || []);
        setFollowing(resFollowing.data || []);
      } catch {
        setStatus({ type: "error", message: "Error cargando tus suscripciones." });
      } finally {
        setLoading(false);
      }
    }
    fetchSubs();
  }, []);

  function UserItem({ u }) {
    const initials = (u.nick_name || u.user?.nick_name || "?").slice(0, 2).toUpperCase();
    const nick = u.nick_name || u.user?.nick_name || u.user?.name;
    const uid = u.id || u.user?.id;
    return (
      <li
        className="flex items-center gap-3 px-4 py-3 hover:bg-mariner-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors rounded-lg"
        onClick={() => navigate(`/users/${uid}`)}
      >
        <div className="w-8 h-8 rounded-full bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-200 flex items-center justify-center text-xs font-bold flex-none">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-mariner-900 dark:text-zinc-100">{nick}</p>
          <p className="text-xs text-mariner-500 dark:text-zinc-400 truncate">
            {u.user?.email || ""}
          </p>
        </div>
      </li>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 mb-1">
          Suscripciones
        </h2>
        <p className="text-sm text-mariner-500 dark:text-zinc-400">
          Mira quién te sigue y a quién estás siguiendo en ComunidadIA.
        </p>
        <StatusMessage type={status.type} message={status.message} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Followers */}
        <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-mariner-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-mariner-900 dark:text-zinc-100">
              Me siguen ({followers.length})
            </h3>
          </div>
          {loading ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 px-5 py-4">Cargando...</p>
          ) : followers.length === 0 ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 px-5 py-4">
              Aún no tienes seguidores.
            </p>
          ) : (
            <ul className="p-2">
              {followers.map((u) => (
                <UserItem key={u.id || u.user?.id} u={u} />
              ))}
            </ul>
          )}
        </div>

        {/* Following */}
        <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-mariner-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-mariner-900 dark:text-zinc-100">
              Siguiendo ({following.length})
            </h3>
          </div>
          {loading ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 px-5 py-4">Cargando...</p>
          ) : following.length === 0 ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 px-5 py-4">
              Aún no sigues a nadie.
            </p>
          ) : (
            <ul className="p-2">
              {following.map((u) => (
                <UserItem key={u.id || u.user?.id} u={u} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
