import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, MessageSquare, Plus, Filter, BookOpen } from "lucide-react";
import publicationService from "../services/publicationService";
import PublicationCard from "../components/PublicationCard";
import Pagination from "../components/Pagination";

const LIMIT = 9;

export default function PublicationsFeedView() {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeType, setActiveType] = useState(""); // "" | "ARTICLE" | "FORUM"
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [noMore, setNoMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar categorías iniciales
  useEffect(() => {
    publicationService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const loadPublications = useCallback(async (currentPage, type, catId, search) => {
    setLoading(true);
    setError("");
    const offset = (currentPage - 1) * LIMIT;
    try {
      const data = await publicationService.getPublications({
        limit: LIMIT,
        offset,
        type,
        category_id: catId,
        search
      });
      const list = Array.isArray(data) ? data : data.results || [];
      setPublications(list);
      setNoMore(list.length < LIMIT);
    } catch (err) {
      setError("Error al cargar las publicaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublications(page, activeType, selectedCategory, searchQuery);
  }, [page, activeType, selectedCategory, searchQuery, loadPublications]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-2">
      {/* Header y Acción Principal */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-300 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-mariner-600" />
            Contenido Académico & Debate
          </div>
          <h1 className="text-2xl font-bold text-mariner-950 dark:text-zinc-50 tracking-tight">
            Comunidad de Conocimiento IA
          </h1>
          <p className="text-sm text-mariner-500 dark:text-zinc-400 mt-1">
            Explora artículos científicos, casos prácticos y foros de discusión creados por educadores.
          </p>
        </div>

        <button
          onClick={() => navigate("/create-publication")}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex-none"
        >
          <Plus className="w-4 h-4" /> Crear Publicación
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        {/* Pestañas de Tipo */}
        <div className="flex items-center gap-1 bg-mariner-50/60 dark:bg-zinc-800/60 p-1 rounded-xl border border-mariner-100 dark:border-zinc-700">
          <button
            onClick={() => { setActiveType(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeType === ""
                ? "bg-white dark:bg-zinc-900 text-mariner-900 dark:text-zinc-50 shadow-xs"
                : "text-mariner-500 dark:text-zinc-400 hover:text-mariner-900"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => { setActiveType("ARTICLE"); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeType === "ARTICLE"
                ? "bg-white dark:bg-zinc-900 text-mariner-900 dark:text-zinc-50 shadow-xs"
                : "text-mariner-500 dark:text-zinc-400 hover:text-mariner-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Artículos
          </button>
          <button
            onClick={() => { setActiveType("FORUM"); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeType === "FORUM"
                ? "bg-white dark:bg-zinc-900 text-mariner-900 dark:text-zinc-50 shadow-xs"
                : "text-mariner-500 dark:text-zinc-400 hover:text-mariner-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Foros
          </button>
        </div>

        {/* Buscador & Selector Categoría */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mariner-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar título o contenido..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-3.5 py-2 bg-mariner-50/50 dark:bg-zinc-800/60 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-mariner-400 dark:text-zinc-500" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-mariner-50/50 dark:bg-zinc-800/60 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-mariner-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-mariner-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Publicaciones */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-2xl p-5 animate-pulse flex flex-col justify-between">
              <div className="h-4 bg-mariner-100 dark:bg-zinc-800 rounded w-1/3" />
              <div className="h-5 bg-mariner-100 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-4 bg-mariner-50 dark:bg-zinc-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : publications.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <BookOpen className="w-12 h-12 text-mariner-300 dark:text-zinc-600" />
          <h3 className="text-base font-semibold text-mariner-900 dark:text-zinc-100">
            No se encontraron publicaciones
          </h3>
          <p className="text-sm text-mariner-400 dark:text-zinc-500 max-w-sm">
            Sé el primero en compartir un artículo o iniciar un debate en el foro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {!loading && publications.length > 0 && (
        <div className="mt-2">
          <Pagination
            page={page}
            onChange={(newPage) => setPage(newPage)}
            disabled={noMore && page > 1}
          />
        </div>
      )}
    </div>
  );
}
