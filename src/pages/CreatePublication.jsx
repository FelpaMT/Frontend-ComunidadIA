import React, { useState, useRef, useEffect } from "react";
import api from "../api/client";
import HtmlEditor from "../components/HtmlEditor";
import StatusMessage from "../components/StatusMessage";
import { useNavigate } from "react-router-dom";

export default function CreatePublication() {
  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
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
      // 1) Crear publicación básica
      const createRes = await api.post("/api/publication/me/create", {
        title,
        publication_type: "ARTICLE",
        content: "temporal",
        ...(categoryId && { category_id: Number(categoryId) }),
      });

      const publicationId = createRes.data.id;

      // 2) Obtener imágenes pendientes desde el editor
      const pendingImages = editorRef.current.getPendingImages();
      
      // 3) Subir imágenes una por una y actualizar URLs
      for (const img of pendingImages) {
        const form = new FormData();
        form.append("publication_id", publicationId);
        form.append("file", img.file);

        const uploadRes = await api.post("/api/upload/", form);
        editorRef.current.setImageUrl(img.index, uploadRes.data.url);
      }

      // 4) Esperar a que React actualice el estado antes de serializar
      await new Promise(resolve => setTimeout(resolve, 100));

      // 5) Serializar HTML con las URLs reales
      editorRef.current.forceSerialize();

      // 6) Esperar otro ciclo para que setHtmlContent se ejecute
      await new Promise(resolve => setTimeout(resolve, 100));

      // 7) Obtener el HTML final actualizado directamente desde el editor
      const blocks = editorRef.current.getBlocks();
      const finalHtml = serializeBlocks(blocks);

      // 8) Update final del contenido
      await api.put(`/api/publication/me/update/${publicationId}`, {
        title,
        content: finalHtml,
        type: "ARTICLE",
        ...(categoryId && { category_id: Number(categoryId) }),
      });

      navigate(`/publications/${publicationId}`);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Error al crear la publicación.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Función helper para serializar bloques (replica la lógica del HtmlEditor)
  function serializeBlocks(blocks) {
    const htmlParts = blocks.map((block) => {
      if (block.type === "paragraph" || block.type.startsWith("heading")) {
        let tag = "p";
        if (block.type === "heading1") tag = "h1";
        if (block.type === "heading2") tag = "h2";
        if (block.type === "heading3") tag = "h3";
        if (block.type === "heading4") tag = "h4";
        if (block.type === "heading5") tag = "h5";
        if (block.type === "heading6") tag = "h6";

        let inner = block.text || "";
        if (block.bold) inner = `<strong>${inner}</strong>`;
        if (block.italic) inner = `<em>${inner}</em>`;

        return `<${tag}>${inner}</${tag}>`;
      }

      if (block.type === "orderedList" || block.type === "unorderedList") {
        const tag = block.type === "orderedList" ? "ol" : "ul";
        const items = (block.text || "")
          .split("\n")
          .filter((i) => i.trim() !== "")
          .map((item) => `<li>${item}</li>`)
          .join("");
        return `<${tag}>${items}</${tag}>`;
      }

      if (block.type === "link") {
        const safeHref = block.href || "#";
        return `<p><a href="${safeHref}" target="_blank" rel="noreferrer">${block.text}</a></p>`;
      }

      if (block.type === "table") {
        const rows = (block.text || "")
          .split("\n")
          .filter((r) => r.trim() !== "")
          .map((row) => {
            const cells = row
              .split("|")
              .map((c) => `<td>${c.trim()}</td>`)
              .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("");

        return `<table>${rows}</table>`;
      }

      if (block.type === "image") {
        const src = block.url || block.srcPreview || "";
        return `<img src="${src}" style="max-width:100%; margin:1rem 0;" />`;
      }

      return "";
    });

    return htmlParts.join("\n");
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
            <HtmlEditor
              ref={editorRef}
              value={htmlContent}
              onChange={setHtmlContent}
              initialBlocks={[]}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar publicación"}
          </button>
        </form>
      </div>
    </div>
  );
}