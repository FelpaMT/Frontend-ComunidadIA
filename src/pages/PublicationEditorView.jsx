import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Folder, Save, ArrowLeft, UploadCloud, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import publicationService from "../services/publicationService";
import HtmlEditor from "../components/HtmlEditor";

export default function PublicationEditorView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [publicationType, setPublicationType] = useState("ARTICLE");
  const [categoryId, setCategoryId] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    publicationService.getCategories().then(setCategories).catch(() => {});

    if (isEditing) {
      publicationService.getPublicationById(id).then((pub) => {
        setTitle(pub.title || "");
        setPublicationType(pub.publication_type || "ARTICLE");
        setCategoryId(pub.category?.id || "");
        setInitialContent(pub.content || "");
        setLoading(false);
      }).catch(() => {
        setFeedback({ type: "error", message: "Error al cargar la publicación a editar." });
        setLoading(false);
      });
    }
  }, [id, isEditing]);

  function handleImageFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImgs = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: ""
    }));
    setSelectedImages((prev) => [...prev, ...newImgs]);
  }

  function handleRemoveSelectedImage(index) {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ type: "error", message: "El título es obligatorio." });
      return;
    }

    const htmlContent = editorRef.current ? editorRef.current.getHtml() : initialContent;
    if (!htmlContent || htmlContent.trim() === "<p><br></p>") {
      setFeedback({ type: "error", message: "El contenido de la publicación no puede estar vacío." });
      return;
    }

    setSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const payload = {
        title: title.trim(),
        publication_type: publicationType,
        content: htmlContent,
        category_id: categoryId ? parseInt(categoryId, 10) : null
      };

      let resultPub;
      if (isEditing) {
        resultPub = await publicationService.updatePublication(id, payload);
      } else {
        resultPub = await publicationService.createPublication(payload);
      }

      // Subir imágenes adjuntas si existen
      if (selectedImages.length > 0 && resultPub.id) {
        for (const img of selectedImages) {
          try {
            await publicationService.uploadImage(resultPub.id, img.file, img.caption);
          } catch (err) {
            // Continuar guardando las demás imágenes
          }
        }
      }

      setFeedback({ type: "success", message: `¡Publicación ${isEditing ? "actualizada" : "creada"} exitosamente!` });
      setTimeout(() => navigate(`/publications/${resultPub.id}`), 1000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Ocurrió un error al guardar la publicación.";
      setFeedback({ type: "error", message: typeof msg === "string" ? msg : JSON.stringify(msg) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mariner-600 dark:border-mariner-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 space-y-6">
      {/* Volver */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-mariner-600 dark:text-zinc-400 hover:text-mariner-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cancelar y volver
      </button>

      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xs">
        <h1 className="text-2xl font-extrabold text-mariner-950 dark:text-zinc-50 mb-1 tracking-tight">
          {isEditing ? "Editar Publicación" : "Crear Nueva Publicación"}
        </h1>
        <p className="text-xs text-mariner-500 dark:text-zinc-400 mb-6">
          Comparte tu artículo pedagógico o inicia un foro de discusión con la comunidad.
        </p>

        {feedback.message && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-3 mb-6 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border border-emerald-200"
                : "bg-red-50 text-red-700 dark:bg-red-950/40 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-none" /> : <AlertCircle className="w-5 h-5 flex-none" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Publicación */}
          <div>
            <label className="block text-xs font-bold text-mariner-900 dark:text-zinc-200 mb-2">
              Tipo de Publicación
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setPublicationType("ARTICLE")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all text-xs font-bold ${
                  publicationType === "ARTICLE"
                    ? "border-mariner-600 bg-mariner-50 text-mariner-900 dark:bg-zinc-800 dark:text-zinc-50 dark:border-mariner-500 shadow-xs"
                    : "border-mariner-200 dark:border-zinc-700 text-mariner-500 dark:text-zinc-400 hover:border-mariner-300"
                }`}
              >
                <FileText className="w-5 h-5 text-mariner-600" />
                <div className="text-left">
                  <div>Artículo</div>
                  <div className="text-[10px] font-normal opacity-70">Contenido educativo estructurado</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPublicationType("FORUM")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all text-xs font-bold ${
                  publicationType === "FORUM"
                    ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-zinc-800 dark:text-zinc-50 dark:border-amber-500 shadow-xs"
                    : "border-mariner-200 dark:border-zinc-700 text-mariner-500 dark:text-zinc-400 hover:border-mariner-300"
                }`}
              >
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <div>Foro</div>
                  <div className="text-[10px] font-normal opacity-70">Debate e hilo de discusión</div>
                </div>
              </button>
            </div>
          </div>

          {/* Título y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-mariner-900 dark:text-zinc-200 mb-1.5">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Escribe un título claro y conciso..."
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-700 rounded-2xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mariner-900 dark:text-zinc-200 mb-1.5 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5" /> Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-700 rounded-2xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500 font-medium"
              >
                <option value="">Selecciona una categoría...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Editor Enriquecido HtmlEditor */}
          <div>
            <label className="block text-xs font-bold text-mariner-900 dark:text-zinc-200 mb-2">
              Cuerpo de la Publicación
            </label>
            <HtmlEditor ref={editorRef} initialHtml={initialContent} />
          </div>

          {/* Zona de Carga de Imágenes Adjuntas */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-mariner-900 dark:text-zinc-200 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-mariner-500" /> Imágenes Adjuntas
            </label>

            <div className="border-2 border-dashed border-mariner-200 dark:border-zinc-700 hover:border-mariner-400 rounded-2xl p-6 text-center bg-mariner-50/40 dark:bg-zinc-800/40 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
                id="image-upload-input"
              />
              <label htmlFor="image-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 text-mariner-400" />
                <span className="text-xs font-semibold text-mariner-700 dark:text-zinc-300">
                  Haz clic para adjuntar imágenes (JPG, PNG)
                </span>
                <span className="text-[10px] text-mariner-400">Puedes seleccionar múltiples archivos</span>
              </label>
            </div>

            {/* Previsualización de imágenes seleccionadas */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {selectedImages.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-mariner-200 dark:border-zinc-700 bg-black/5 aspect-square">
                    <img src={img.preview} alt="Previsualización" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px] shadow-sm hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón Guardar */}
          <div className="pt-4 border-t border-mariner-100 dark:border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 text-white text-xs font-bold rounded-2xl transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Guardando..." : isEditing ? "Actualizar Publicación" : "Publicar Ahora"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
