import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import HtmlEditor from "../components/HtmlEditor";
import StatusMessage from "../components/StatusMessage";

const inputClass =
  "w-full px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 focus:border-transparent text-sm transition-colors";

export default function EditPublication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [initialHtml, setInitialHtml] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const editorRef = useRef();

  useEffect(() => {
    api.get("/api/publication/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    async function fetchPublication() {
      try {
        const res = await api.get(`/api/publications/${id}`);
        setTitle(res.data.title);
        setInitialHtml(res.data.content || "");
        setCategoryId(res.data.category ? String(res.data.category.id) : "");
      } catch {
        setError("No se pudo cargar la publicación.");
      } finally {
        setLoading(false);
      }
    }
    fetchPublication();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const pendingImages = editorRef.current.getPendingImages();
      for (const img of pendingImages) {
        const form = new FormData();
        form.append("publication_id", id);
        form.append("file", img.file);
        const resUpload = await api.post("/api/upload/", form);
        editorRef.current.setImageUrl(img.blobUrl, resUpload.data.url);
      }

      const finalHtml = editorRef.current.getHtml();
      await api.put(`/api/publication/me/update/${id}`, {
        title,
        content: finalHtml,
        type: "ARTICLE",
        category_id: categoryId ? Number(categoryId) : null,
      });

      navigate(`/publications/${id}`);
    } catch {
      setError("Error guardando la publicación.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-8 text-sm text-mariner-400 dark:text-zinc-500">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 mb-4">
          Editar publicación
        </h2>

        {error && <StatusMessage type="error" message={error} />}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-mariner-700 dark:text-zinc-400 mb-1">
              Título
            </label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            <HtmlEditor ref={editorRef} initialHtml={initialHtml} />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              onClick={() => navigate(`/publications/${id}`)}
              className="px-5 py-2.5 border border-mariner-200 dark:border-zinc-700 text-mariner-700 dark:text-zinc-400 hover:bg-mariner-50 dark:hover:bg-zinc-800 text-sm font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
