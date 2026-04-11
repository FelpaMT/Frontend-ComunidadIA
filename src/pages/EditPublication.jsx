import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { marked } from "marked";
import HtmlEditor from "../components/HtmlEditor";

function htmlToBlocks(html) {
  const template = document.createElement("div");
  template.innerHTML = html;

  const blocks = [];

  template.childNodes.forEach((el) => {
    if (el.nodeType !== 1) return;

    if (el.tagName === "P") {
      blocks.push({
        type: "paragraph",
        text: el.textContent || "",
        bold: el.innerHTML.includes("<strong>"),
        italic: el.innerHTML.includes("<em>"),
      });
    }

    if (["H1","H2","H3","H4","H5","H6"].includes(el.tagName)) {
      blocks.push({
        type: `heading${el.tagName[1]}`,
        text: el.textContent || "",
        bold: el.innerHTML.includes("<strong>"),
        italic: el.innerHTML.includes("<em>"),
      });
    }

    if (el.tagName === "OL") {
      const items = [...el.querySelectorAll("li")].map((li) => li.textContent);
      blocks.push({
        type: "orderedList",
        text: items.join("\n"),
      });
    }

    if (el.tagName === "UL") {
      const items = [...el.querySelectorAll("li")].map((li) => li.textContent);
      blocks.push({
        type: "unorderedList",
        text: items.join("\n"),
      });
    }

    if (el.tagName === "A") {
      blocks.push({
        type: "link",
        text: el.textContent,
        href: el.getAttribute("href"),
      });
    }

    if (el.tagName === "IMG") {
      blocks.push({
        type: "image",
        file: null,
        url: el.getAttribute("src"),
        srcPreview: el.getAttribute("src"),
      });
    }

    if (el.tagName === "TABLE") {
      const rows = [...el.querySelectorAll("tr")].map((tr) =>
        [...tr.querySelectorAll("td")].map((td) => td.textContent).join("|")
      );
      blocks.push({
        type: "table",
        text: rows.join("\n"),
      });
    }
  });

  return blocks;
}

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

export default function EditPublication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialBlocks, setInitialBlocks] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const editorRef = useRef();

  // ░░░ Cargar categorías y publicación
  useEffect(() => {
    api.get("/api/publication/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    async function fetchPublication() {
      try {
        const res = await api.get(`/api/publications/${id}`);
        setTitle(res.data.title);
        setContent(res.data.content);
        setInitialBlocks(htmlToBlocks(res.data.content));
        setCategoryId(res.data.category ? String(res.data.category.id) : "");
      } catch {
        setError("No se pudo cargar la publicación.");
      } finally {
        setLoading(false);
      }
    }

    fetchPublication();
  }, [id]);

  // ░░░ Guardar cambios
  async function handleSave() {
    setSaving(true);

    try {
      const pendingImages = editorRef.current.getPendingImages();

      // Subir imágenes nuevas
      for (const img of pendingImages) {
        const form = new FormData();
        form.append("publication_id", id);
        form.append("file", img.file);

        const resUpload = await api.post("/api/upload/", form);
        editorRef.current.setImageUrl(img.index, resUpload.data.url);
      }
      // 4) Esperar a que React actualice el estado antes de serializar
      await new Promise(resolve => setTimeout(resolve, 100));

      // 5) Serializar HTML con las URLs reales
      editorRef.current.forceSerialize();

      // 6) Esperar otro ciclo para que setHtmlContent se ejecute
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Obtener bloques actualizados y serializar localmente
      const blocks = editorRef.current.getBlocks();
      const finalHtml = serializeBlocks(blocks);

      // Guardar con las URLs reales
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

      {/* Editor */}
      <div className="card">
        <label>Contenido</label>

        <HtmlEditor
          ref={editorRef}
          value={content}
          onChange={setContent}
          initialBlocks={initialBlocks}
        />
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

      {/* Vista previa */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <h3>Vista previa</h3>
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: marked.parse(content || "") }}
        />
      </div>
    </div>
  );
}