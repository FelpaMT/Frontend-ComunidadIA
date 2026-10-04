import React, { useEffect, useState, useCallback } from "react";
import { Search, Users, Sparkles, SlidersHorizontal } from "lucide-react";
import educatorService from "../services/educatorService";
import EducatorCard from "../components/EducatorCard";
import Pagination from "../components/Pagination";

const LIMIT = 9;

export default function EducatorsDirectoryView() {
  const [educators, setEducators] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [noMore, setNoMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce para la búsqueda interactiva
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const loadEducators = useCallback(async (currentPage, searchQuery) => {
    setLoading(true);
    setError("");
    const offset = (currentPage - 1) * LIMIT;
    try {
      const data = await educatorService.getEducators({
        limit: LIMIT,
        offset,
        q: searchQuery
      });
      const list = Array.isArray(data) ? data : data.results || [];
      setEducators(list);
      setNoMore(list.length < LIMIT);
    } catch (err) {
      setError("No se pudo cargar el directorio de educadores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEducators(page, debouncedQuery);
  }, [page, debouncedQuery, loadEducators]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-2">
      {/* Encabezado e Búsqueda */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-mariner-600" />
              Red Social Educativa
            </div>
            <h1 className="text-2xl font-bold text-mariner-950 dark:text-zinc-50 tracking-tight">
              Directorio de Educadores en IA
            </h1>
            <p className="text-sm text-mariner-500 dark:text-zinc-400 mt-1">
              Conecta, colabora y aprende junto a docentes apasionados por la inteligencia artificial.
            </p>
          </div>
        </div>

        {/* Buscador Interactivo */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-mariner-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3.5 bg-mariner-50/50 dark:bg-zinc-800/60 border border-mariner-200 dark:border-zinc-700 rounded-2xl text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 text-sm transition-all shadow-inner"
            placeholder="Buscar educador por nombre, usuario, especialidad o institución..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Estado y Grid de Educadores */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-48 bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-2xl p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-mariner-100 dark:bg-zinc-800 rounded-2xl" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-mariner-100 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-mariner-50 dark:bg-zinc-800/60 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-mariner-50 dark:bg-zinc-800/60 rounded w-full" />
              <div className="h-8 bg-mariner-100 dark:bg-zinc-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : educators.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <Users className="w-12 h-12 text-mariner-300 dark:text-zinc-600" />
          <h3 className="text-base font-semibold text-mariner-900 dark:text-zinc-100">
            No se encontraron educadores
          </h3>
          <p className="text-sm text-mariner-400 dark:text-zinc-500 max-w-sm">
            Intenta cambiar los términos de búsqueda para encontrar docentes en la red.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {educators.map((edu) => (
            <EducatorCard
              key={edu.id}
              educator={edu}
              onFollowChange={() => loadEducators(page, debouncedQuery)}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {!loading && educators.length > 0 && (
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
