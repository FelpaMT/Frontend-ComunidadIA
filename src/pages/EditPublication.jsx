import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import HtmlEditor from "../components/HtmlEditor";

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
    try {
      // 1) Subir imágenes nuevas añadidas durante la edición
      const pendingImages = editorRef.current.getPendingImages();
      for (const img of pendingImages) {
        const form = new FormData();
        form.append("publication_id", id);
        form.append("file", img.file);
        const resUpload = await api.post("/api/upload/", form);
        editorRef.current.setImageUrl(img.blobUrl, resUpload.data.url);
      }

      // 2) Obtener HTML final con todas las URLs ya resueltas
      const finalHtml = editorRef.current.getHtml();

      // 3) Guardar
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

  if (loading) return <div className="page">Cargando...</div>;

  return (
    <div className="page">
      <h2 className="page-title">Editar publicación</h2>

      {error && <div className="error-box">{error}</div>}

      <div className="card" style={{ marginBottom: "1rem" }}>
        <label>Título</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <label>Categoría</label>
        <select
          className="select"
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

      <div className="card">
        <label>Contenido</label>
        <HtmlEditor ref={editorRef} initialHtml={initialHtml} />
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          className="btn btn-primary"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        <button
          className="btn btn-outline"
          onClick={() => navigate(`/publications/${id}`)}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
