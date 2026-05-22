import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import api from "../api/client";
import PublicationCard from "../components/PublicationCard";
import Pagination from "../components/Pagination";
import StatusMessage from "../components/StatusMessage";

const LIMIT = 10;

const inputClass =
  "w-full px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 focus:border-transparent text-sm transition-colors";

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [page, setPage] = useState(1);
  const [nicknamePart, setNicknamePart] = useState("");
  const [titlePart, setTitlePart] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);
  const [noMore, setNoMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/publication/categories").then((res) => setCategories(res.data));
  }, []);

  async function fetchPublications(newPage = 1, isSearch = false) {
    setLoading(true);
    setStatus({ type: "info", message: "" });
    const offset = (newPage - 1) * LIMIT;
    try {
      let res;
      const hasSearchParams = nicknamePart || titlePart || categoryId;
      if (isSearch && hasSearchParams) {
        res = await api.get("/api/publication/search", {
          params: {
            limit: LIMIT,
            offset,
            nickname_part: nicknamePart || undefined,
            title_part: titlePart || undefined,
            category_id: categoryId || undefined,
          },
        });
      } else if (!isSearch && categoryId) {
        res = await api.get("/api/publication", {
          params: { limit: LIMIT, offset, category_id: categoryId },
        });
      } else {
        res = await api.get("/api/publication", { params: { limit: LIMIT, offset } });
      }
      const data = res.data || [];
      setPublications(data);
      setNoMore(data.length < LIMIT);
      setPage(newPage);
    } catch {
      setStatus({ type: "error", message: "Error cargando publicaciones." });
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

  function handleClear() {
    setNicknamePart("");
    setTitlePart("");
    setCategoryId("");
    fetchPublications(1, false);
  }

  function handlePageChange(newPage) {
    if (newPage < 1) return;
    fetchPublications(newPage, !!(nicknamePart || titlePart || categoryId));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search card */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-5">
        <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 mb-1">
          Publicaciones
        </h2>
        <p className="text-sm text-mariner-500 dark:text-zinc-400 mb-4">
          Explora todos los artículos publicados en ComunidadIA.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
                Autor (nick)
              </label>
              <input
                className={inputClass}
                value={nicknamePart}
                onChange={(e) => setNicknamePart(e.target.value)}
                placeholder="Buscar por autor..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
                Título
              </label>
              <input
                className={inputClass}
                value={titlePart}
                onChange={(e) => setTitlePart(e.target.value)}
                placeholder="Buscar por título..."
              />
            </div>
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
                Categoría
              </label>
              <select
                className={inputClass}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pb-0.5">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Search size={14} />
                Buscar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 border border-mariner-200 dark:border-zinc-700 text-mariner-600 dark:text-zinc-400 hover:bg-mariner-50 dark:hover:bg-zinc-800 text-sm font-medium rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results card */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="p-3">
          <StatusMessage type={status.type} message={status.message} />

          {loading ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 px-3 py-4">
              Cargando publicaciones...
            </p>
          ) : publications.length === 0 ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 px-3 py-4">
              No se encontraron publicaciones.
            </p>
          ) : (
            publications.map((p) => (
              <PublicationCard
                key={p.id}
                publication={p}
                onClick={() => navigate(`/publications/${p.id}`)}
              />
            ))
          )}
        </div>

        <Pagination
          page={page}
          onChange={handlePageChange}
          disabled={noMore && publications.length < LIMIT && page > 1}
        />
      </div>
    </div>
  );
}
