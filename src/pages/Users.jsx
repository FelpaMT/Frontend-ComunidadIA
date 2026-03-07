import React, { useEffect, useState } from "react";
import api from "../api/client";
import Pagination from "../components/Pagination";
import StatusMessage from "../components/StatusMessage";
import UserCard from "../components/UserCard";
import { useNavigate } from "react-router-dom";

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
        res = await api.get("/api/educator/search", {
          params: { limit: LIMIT, offset, q },
        });
      } else {
        res = await api.get("/api/educator", {
          params: { limit: LIMIT, offset },
        });
      }
      const data = res.data || [];
      setUsers(data);
      setNoMore(data.length < LIMIT);
      setPage(newPage);
    } catch {
      setStatus({
        type: "error",
        message: "Error cargando usuarios.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers(1, false);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchUsers(1, true);
  }

  function handlePageChange(newPage) {
    if (newPage < 1) return;
    fetchUsers(newPage, !!q);
  }

  async function handleToggleFollow(u) {
    setFollowLoadingId(u.id);
    try {
      if (u.followed_by_me) {
        await api.post(`/api/subscription/unfollow/${u.id}`);
        setStatus({
          type: "success",
          message: `Dejaste de seguir a ${u.nick_name}.`,
        });
      } else {
        await api.post(`/api/subscription/follow/${u.id}`);
        setStatus({
          type: "success",
          message: `Ahora sigues a ${u.nick_name}.`,
        });
      }
      // actualizar estado local
      setUsers((prev) =>
        prev.map((x) =>
          x.id === u.id ? { ...x, followed_by_me: !u.followed_by_me } : x
        )
      );
    } catch {
      setStatus({
        type: "error",
        message: "Error al actualizar la suscripción.",
      });
    } finally {
      setFollowLoadingId(null);
    }
  }

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <div className="card">
        <h2 className="page-title">Usuarios</h2>
        <p className="page-subtitle">
          Encuentra y sigue a otros docentes interesados en IA aplicada a la
          educación.
        </p>
        <form
          className="grid"
          style={{ gap: "0.75rem", maxWidth: 420 }}
          onSubmit={handleSearch}
        >
          <div>
            <label>Buscar por nick_name</label>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Parte del nick"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            🔍 Buscar
          </button>
        </form>
      </div>

      <div className="card">
        <StatusMessage type={status.type} message={status.message} />
        {loading ? (
          <div>Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
            No se encontraron usuarios.
          </div>
        ) : (
          <div className="grid" style={{ gap: "0.8rem" }}>
            {users.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onDetail={() => navigate(`/users/${u.id}`)}
                onToggleFollow={() => handleToggleFollow(u)}
                loadingFollow={followLoadingId === u.id}
              />
            ))}
          </div>
        )}
        <Pagination
          page={page}
          onChange={handlePageChange}
          disabled={noMore && users.length < LIMIT && page > 1}
        />
      </div>
    </div>
  );
}
