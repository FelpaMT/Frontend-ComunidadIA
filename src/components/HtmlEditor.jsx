import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["clean"],
];

function HtmlEditor({ initialHtml = "" }, ref) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const pendingImagesRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Quill agrega la clase "ql-container" al elemento cuando ya está inicializado.
    // Este chequeo evita que StrictMode (que ejecuta los effects dos veces en dev)
    // cree una segunda toolbar duplicada.
    if (container.classList.contains("ql-container")) return;

    const quill = new Quill(container, {
      theme: "snow",
      placeholder: "Escribe el contenido de tu publicación...",
      modules: {
        toolbar: {
          container: TOOLBAR,
          handlers: {
            image: () => {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");
              input.click();
              input.onchange = () => {
                const file = input.files?.[0];
                if (!file) return;
                const blobUrl = URL.createObjectURL(file);
                pendingImagesRef.current.push({ file, blobUrl });
                const range = quillRef.current.getSelection(true);
                quillRef.current.insertEmbed(range.index, "image", blobUrl, "user");
                quillRef.current.setSelection(range.index + 1, 0, "user");
              };
            },
          },
        },
      },
    });

    if (initialHtml) {
      quill.clipboard.dangerouslyPasteHTML(initialHtml);
      quill.history.clear();
    }

    quillRef.current = quill;
  }, []);

  useImperativeHandle(ref, () => ({
    // Retorna el HTML final del editor con todas las URLs resueltas
    getHtml: () => quillRef.current?.root.innerHTML ?? "",

    // Retorna imágenes con archivo pendiente de subir al backend
    getPendingImages: () => pendingImagesRef.current,

    // Reemplaza un blob URL temporal con la URL real del backend
    setImageUrl: (blobUrl, realUrl) => {
      if (!quillRef.current) return;
      const delta = quillRef.current.getContents();
      const newOps = delta.ops.map((op) => {
        if (
          op.insert &&
          typeof op.insert === "object" &&
          op.insert.image === blobUrl
        ) {
          return { ...op, insert: { image: realUrl } };
        }
        return op;
      });
      quillRef.current.setContents({ ops: newOps }, "silent");
      pendingImagesRef.current = pendingImagesRef.current.filter(
        (p) => p.blobUrl !== blobUrl
      );
    },

    // No-op — mantenido para no romper los consumidores existentes
    forceSerialize: () => {},
  }));

  return (
    <div className="quill-wrapper">
      <div ref={containerRef} />
    </div>
  );
}

export default forwardRef(HtmlEditor);
