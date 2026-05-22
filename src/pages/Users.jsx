import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../api/client";
import Pagination from "../components/Pagination";
import StatusMessage from "../components/StatusMessage";
import UserCard from "../components/UserCard";

const LIMIT = 10;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [noMore, setNoMore] = useState(false);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);
  const [followLoadingId, setFollowLoadingId] = useState(null);
  const navigate = useNavigate();

  async function fetchUsers(newPage = 1, isSearch = false) {
    setLoading(true);
    setStatus({ type: "info", message: "" });
    const offset = (newPage - 1) * LIMIT;
    try {
      let res;
      if (isSearch && q) {
        res = await api.get("/api/educator/search", { params: { limit: LIMIT, offset, q } });
      } else {
        res = await api.get("/api/educator", { params: { limit: LIMIT, offset } });
      }
      const data = res.data || [];
      setUsers(data);
      setNoMore(data.length < LIMIT);
      setPage(newPage);
    } catch {
      setStatus({ type: "error", message: "Error cargando usuarios." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(1, false); }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchUsers(1, true);
  }

  async function handleToggleFollow(u) {
    setFollowLoadingId(u.id);
    try {
      if (u.followed_by_me) {
        await api.post(`/api/subscription/unfollow/${u.id}`);
        setStatus({ type: "success", message: `Dejaste de seguir a ${u.nick_name}.` });
      } else {
        await api.post(`/api/subscription/follow/${u.id}`);
        setStatus({ type: "success", message: `Ahora sigues a ${u.nick_name}.` });
      }
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, followed_by_me: !u.followed_by_me } : x))
      );
    } catch {
      setStatus({ type: "error", message: "Error al actualizar la suscripción." });
    } finally {
      setFollowLoadingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-5">
        <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 mb-1">
          Usuarios
        </h2>
        <p className="text-sm text-mariner-500 dark:text-zinc-400 mb-4">
          Encuentra y sigue a otros docentes interesados en IA aplicada a la educación.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
          <input
            className="flex-1 px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 text-sm transition-colors"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nickname..."
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Search size={14} />
            Buscar
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="p-3">
          <StatusMessage type={status.type} message={status.message} />
          {loading ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 px-3 py-4">
              Cargando usuarios...
            </p>
          ) : users.length === 0 ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 px-3 py-4">
              No se encontraron usuarios.
            </p>
          ) : (
            users.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onDetail={() => navigate(`/users/${u.id}`)}
                onToggleFollow={() => handleToggleFollow(u)}
                loadingFollow={followLoadingId === u.id}
              />
            ))
          )}
        </div>
        <Pagination
          page={page}
          onChange={(p) => { if (p >= 1) fetchUsers(p, !!q); }}
          disabled={noMore && users.length < LIMIT && page > 1}
        />
      </div>
    </div>
  );
}
