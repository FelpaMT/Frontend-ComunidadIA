import React, {
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";

const initialBlock = {
  type: "paragraph",
  text: "",
  bold: false,
  italic: false,
};

function SafeButton({ onClick, children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}

function HtmlEditor({ value, onChange, initialBlocks }, ref) {
  const [blocks, setBlocks] = useState(initialBlocks || []);

  // ░░░ Métodos públicos para Create/EditPublication
  useImperativeHandle(ref, () => ({
    getBlocks: () => blocks,
    getPendingImages: () =>
      blocks
        .map((b, index) => ({ ...b, index }))
        .filter((b) => b.type === "image" && b.file),
    setImageUrl: (index, url) => {
      setBlocks((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          url,
          file: null,
        };
        return updated;
      });
    },
    forceSerialize: () => serialize(),
  }));

  // ░░░ Añadir bloques
  function addBlock(type) {
    if (type === "image") {
      setBlocks((b) => [
        ...b,
        {
          type: "image",
          file: null,
          url: "",
          srcPreview: "",
        },
      ]);
      return;
    }

    if (type === "table") {
      setBlocks((b) => [
        ...b,
        {
          type: "table",
          text: "fila1col1|fila1col2\nfila2col1|fila2col2",
        },
      ]);
      return;
    }

    if (type === "link") {
      setBlocks((b) => [
        ...b,
        { type: "link", text: "Texto del enlace", href: "https://..." },
      ]);
      return;
    }

    if (type === "orderedList" || type === "unorderedList") {
      setBlocks((b) => [...b, { type, text: "Item 1\nItem 2\nItem 3" }]);
      return;
    }

    setBlocks((b) => [...b, { ...initialBlock, type }]);
  }

  // ░░░ Actualizar bloques
  function updateBlock(index, changes) {
    setBlocks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...changes };
      return updated;
    });
  }

  // ░░░ Eliminar bloques
  function removeBlock(index) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  // ░░░ Serializar HTML final
  function serialize() {
    const htmlParts = blocks.map((block) => {
      // Párrafos y headers
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

      // Listas
      if (block.type === "orderedList" || block.type === "unorderedList") {
        const tag = block.type === "orderedList" ? "ol" : "ul";
        const items = (block.text || "")
          .split("\n")
          .filter((i) => i.trim() !== "")
          .map((item) => `<li>${item}</li>`)
          .join("");
        return `<${tag}>${items}</${tag}>`;
      }

      // Enlaces
      if (block.type === "link") {
        const safeHref = block.href || "#";
        return `<p><a href="${safeHref}" target="_blank" rel="noreferrer">${block.text}</a></p>`;
      }

      // Tablas
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

      // ░░░ NUEVO: Imagen
      if (block.type === "image") {
        const src = block.url || block.srcPreview || "";
        return `<img src="${src}" style="max-width:100%; margin:1rem 0;" />`;
      }

      return "";
    });

    const html = htmlParts.join("\n");
    onChange(html);
  }

  return (
    <div className="html-editor">
      {/* Toolbar */}
      <div className="html-editor-toolbar">
        <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>Constructor</span>

        <SafeButton onClick={() => addBlock("paragraph")}>+ Párrafo</SafeButton>
        <SafeButton onClick={() => addBlock("heading2")}>+ Título H2</SafeButton>
        <SafeButton onClick={() => addBlock("orderedList")}>+ Lista ordenada</SafeButton>
        <SafeButton onClick={() => addBlock("unorderedList")}>+ Lista</SafeButton>
        <SafeButton onClick={() => addBlock("link")}>+ Enlace</SafeButton>
        <SafeButton onClick={() => addBlock("table")}>+ Tabla</SafeButton>
        <SafeButton onClick={() => addBlock("image")}>+ Imagen</SafeButton>

        <SafeButton onClick={serialize}>Actualizar HTML</SafeButton>
      </div>

      {/* Editor */}
      <div className="grid">
        {blocks.map((block, index) => (
          <div key={index} className="card" style={{ padding: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8rem" }}>{block.type}</span>
              <SafeButton
                className="btn btn-outline"
                style={{ padding: "0.2rem 0.6rem", fontSize: "0.7rem" }}
                onClick={() => removeBlock(index)}
              >
                Eliminar
              </SafeButton>
            </div>

            {/* Texto */}
            {(block.type.startsWith("heading") ||
              block.type === "paragraph") && (
              <>
                <textarea
                  className="textarea"
                  value={block.text}
                  onChange={(e) =>
                    updateBlock(index, { text: e.target.value })
                  }
                />
                <label>
                  <input
                    type="checkbox"
                    checked={!!block.bold}
                    onChange={(e) =>
                      updateBlock(index, { bold: e.target.checked })
                    }
                  />
                  Negrita
                </label>
                <label style={{ marginLeft: "10px" }}>
                  <input
                    type="checkbox"
                    checked={!!block.italic}
                    onChange={(e) =>
                      updateBlock(index, { italic: e.target.checked })
                    }
                  />
                  Cursiva
                </label>
              </>
            )}

            {/* Listas */}
            {(block.type === "orderedList" ||
              block.type === "unorderedList") && (
              <textarea
                className="textarea"
                value={block.text}
                onChange={(e) => updateBlock(index, { text: e.target.value })}
              />
            )}

            {/* Link */}
            {block.type === "link" && (
              <>
                <input
                  className="input"
                  value={block.text}
                  onChange={(e) =>
                    updateBlock(index, { text: e.target.value })
                  }
                />
                <input
                  className="input"
                  value={block.href}
                  onChange={(e) =>
                    updateBlock(index, { href: e.target.value })
                  }
                />
              </>
            )}

            {/* Tabla */}
            {block.type === "table" && (
              <textarea
                className="textarea"
                value={block.text}
                onChange={(e) => updateBlock(index, { text: e.target.value })}
              />
            )}

            {/* Imagen */}
            {block.type === "image" && (
              <div style={{ marginTop: "0.5rem" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (!e.target.files?.[0]) return;
                    const file = e.target.files[0];
                    updateBlock(index, {
                      file,
                      srcPreview: URL.createObjectURL(file),
                    });
                  }}
                />

                {(block.srcPreview || block.url) && (
                  <img
                    src={block.srcPreview || block.url}
                    style={{
                      marginTop: "0.5rem",
                      maxWidth: "100%",
                      borderRadius: "4px",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vista previa */}
      <div className="html-editor-preview">
        <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>Vista previa</div>
        <div
          className="html-viewer"
          dangerouslySetInnerHTML={{ __html: value || "" }}
        />
      </div>
    </div>
  );
}

export default forwardRef(HtmlEditor);
