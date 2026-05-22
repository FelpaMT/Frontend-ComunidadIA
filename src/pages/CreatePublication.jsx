import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import HtmlEditor from "../components/HtmlEditor";
import StatusMessage from "../components/StatusMessage";

const inputClass =
  "w-full px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 focus:border-transparent text-sm transition-colors";

export default function CreatePublication() {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(false);
  const editorRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/publication/categories").then((res) => setCategories(res.data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title) {
      setStatus({ type: "error", message: "El título es obligatorio" });
      return;
    }
    setLoading(true);
    setStatus({ type: "info", message: "" });
    try {
      const createRes = await api.post("/api/publication/me/create", {
        title,
        publication_type: "ARTICLE",
        content: "temporal",
        ...(categoryId && { category_id: Number(categoryId) }),
      });
      const publicationId = createRes.data.id;

      const pendingImages = editorRef.current.getPendingImages();
      for (const img of pendingImages) {
        const form = new FormData();
        form.append("publication_id", publicationId);
        form.append("file", img.file);
        const uploadRes = await api.post("/api/upload/", form);
        editorRef.current.setImageUrl(img.blobUrl, uploadRes.data.url);
      }

      const finalHtml = editorRef.current.getHtml();
      await api.put(`/api/publication/me/update/${publicationId}`, {
        title,
        content: finalHtml,
        type: "ARTICLE",
        ...(categoryId && { category_id: Number(categoryId) }),
      });

      navigate(`/publications/${publicationId}`);
    } catch {
      setStatus({ type: "error", message: "Error al crear la publicación." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 mb-4">
          Crear publicación
        </h2>

        <StatusMessage type={status.type} message={status.message} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
              Título
            </label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la publicación..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
              Categoría
            </label>
            <select
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
              Contenido
            </label>
            <HtmlEditor ref={editorRef} />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Publicar"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-mariner-200 dark:border-zinc-700 text-mariner-700 dark:text-zinc-400 hover:bg-mariner-50 dark:hover:bg-zinc-800 text-sm font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
