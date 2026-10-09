import { useState } from "react";
import DOMPurify from "dompurify";

export default function HtmlEditor({ value, onChange }) {
  const [html, setHtml] = useState(value || "");

  function update(val) {
    setHtml(val);
    onChange(val);
  }

  function insert(tag) {
    update(html + tag);
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn btn-outline" type="button" onClick={() => insert("<p>Nuevo párrafo...</p>")}>
            + Párrafo
          </button>

          <button className="btn btn-outline" type="button" onClick={() => insert("<h2>Título H2</h2>")}>
            + Título (H2)
          </button>

          <button className="btn btn-outline" type="button" onClick={() => insert("<ol><li>Elemento</li></ol>")}>
            + Lista ordenada
          </button>

          <button className="btn btn-outline" type="button" onClick={() => insert("<ul><li>Elemento</li></ul>")}>
            + Lista
          </button>

          <button className="btn btn-outline" type="button" onClick={() => insert('<a href="#">Nuevo enlace</a>')}>
            + Enlace
          </button>

          <button className="btn btn-outline" type="button" onClick={() => insert("<table><tr><td>A</td></tr></table>")}>
            + Tabla simple
          </button>

          <button className="btn btn-primary" type="button" onClick={() => update(html)}>
            Actualizar HTML
          </button>
        </div>

        <textarea
          className="input"
          style={{ marginTop: "1rem", height: "200px" }}
          value={html}
          onChange={(e) => update(e.target.value)}
        />
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "0.5rem" }}>Vista previa (HTML actual):</h3>
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        />
      </div>
    </div>
  );
}
