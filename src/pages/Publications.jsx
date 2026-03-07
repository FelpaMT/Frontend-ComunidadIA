import React, { useEffect, useState } from "react";
import api from "../api/client";
import PublicationCard from "../components/PublicationCard";
import Pagination from "../components/Pagination";
import StatusMessage from "../components/StatusMessage";
import { useNavigate } from "react-router-dom";

const LIMIT = 10;

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [page, setPage] = useState(1);
  const [nicknamePart, setNicknamePart] = useState("");
  const [titlePart, setTitlePart] = useState("");
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);
  const [noMore, setNoMore] = useState(false);
  const navigate = useNavigate();

  async function fetchPublications(newPage = 1, isSearch = false) {
    setLoading(true);
    setStatus({ type: "info", message: "" });
    const offset = (newPage - 1) * LIMIT;
    try {
      let res;
      if (isSearch && (nicknamePart || titlePart)) {
        res = await api.get("/api/publication/search", {
          params: {
            limit: LIMIT,
            offset,
            nickname_part: nicknamePart || undefined,
            title_part: titlePart || undefined,
          },
        });
      } else {
        res = await api.get("/api/publication", {
          params: { limit: LIMIT, offset },
        });
      }
      const data = res.data || [];
      setPublications(data);
      setNoMore(data.length < LIMIT);
      setPage(newPage);
    } catch {
      setStatus({
        type: "error",
        message: "Error cargando publicaciones.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPublications(1, false);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchPublications(1, true);
  }

  function handlePageChange(newPage) {
    if (newPage < 1) return;
    fetchPublications(newPage, !!(nicknamePart || titlePart));
  }

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <div className="card">
        <h2 className="page-title">Publicaciones</h2>
        <p className="page-subtitle">
          Explora todos los artículos publicados en ComunidadIA.
        </p>
        <form
          className="grid grid-2"
          style={{ gap: "0.75rem", marginTop: "1rem" }}
          onSubmit={handleSearch}
        >
          <div>
            <label>Búsqueda por nick_name</label>
            <input
              className="input"
              value={nicknamePart}
              onChange={(e) => setNicknamePart(e.target.value)}
              placeholder="Parte del nick del autor"
            />
          </div>
          <div>
            <label>Búsqueda por título</label>
            <input
              className="input"
              value={titlePart}
              onChange={(e) => setTitlePart(e.target.value)}
              placeholder="Parte del título"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-primary" type="submit">
              🔍 Buscar
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ marginLeft: "0.5rem" }}
              onClick={() => {
                setNicknamePart("");
                setTitlePart("");
                fetchPublications(1, false);
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <StatusMessage type={status.type} message={status.message} />
        {loading ? (
          <div>Cargando publicaciones...</div>
        ) : publications.length === 0 ? (
          <div style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
            No se encontraron publicaciones.
          </div>
        ) : (
          <div className="grid" style={{ gap: "0.8rem" }}>
            {publications.map((p) => (
              <PublicationCard
                key={p.id}
                publication={p}
                onClick={() => navigate(`/publications/${p.id}`)}
              />
            ))}
          </div>
        )}
        <Pagination
          page={page}
          onChange={handlePageChange}
          disabled={noMore && publications.length < LIMIT && page > 1}
        />
      </div>
    </div>
  );
}
