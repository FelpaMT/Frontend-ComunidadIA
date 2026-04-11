import React, { useState, useRef, useEffect } from "react";
import api from "../api/client";
import HtmlEditor from "../components/HtmlEditor";
import StatusMessage from "../components/StatusMessage";
import { useNavigate } from "react-router-dom";

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
      // 1) Crear publicación básica para obtener el ID
      const createRes = await api.post("/api/publication/me/create", {
        title,
        publication_type: "ARTICLE",
        content: "temporal",
        ...(categoryId && { category_id: Number(categoryId) }),
      });

      const publicationId = createRes.data.id;

      // 2) Subir imágenes pendientes y reemplazar blob URLs con URLs reales
      const pendingImages = editorRef.current.getPendingImages();
      for (const img of pendingImages) {
        const form = new FormData();
        form.append("publication_id", publicationId);
        form.append("file", img.file);
        const uploadRes = await api.post("/api/upload/", form);
        editorRef.current.setImageUrl(img.blobUrl, uploadRes.data.url);
      }

      // 3) Obtener HTML final con todas las URLs reales ya resueltas
      const finalHtml = editorRef.current.getHtml();

      // 4) Guardar contenido final
      await api.put(`/api/publication/me/update/${publicationId}`, {
        title,
        content: finalHtml,
        type: "ARTICLE",
        ...(categoryId && { category_id: Number(categoryId) }),
      });

      navigate(`/publications/${publicationId}`);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Error al crear la publicación." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <div className="card">
        <h2 className="page-title">Crear publicación</h2>

        <StatusMessage type={status.type} message={status.message} />

        <form className="grid" style={{ gap: "1rem" }} onSubmit={handleSubmit}>
          <div>
            <label>Título</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título…"
            />
          </div>

          <div>
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

          <div>
            <label>Contenido</label>
            <HtmlEditor ref={editorRef} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar publicación"}
          </button>
        </form>
      </div>
    </div>
  );
}
