import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Folder, Trash2, Edit, Send, ArrowLeft, MessageCircle, Image as ImageIcon, ShieldAlert } from "lucide-react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useAuth } from "../context/AuthContext";
import publicationService from "../services/publicationService";

export default function PublicationDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [publication, setPublication] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const data = await publicationService.getPublicationById(id);
      setPublication(data);
      setComments(data.comments || []);
    } catch (err) {
      setError("No se pudo cargar la publicación.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const isAuthor =
    user &&
    publication &&
    (user.id === publication.writer?.user?.id ||
      user.id === publication.writer?.id ||
      user.role === "ADMIN");

  async function handleDeletePublication() {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta publicación?")) return;
    try {
      await publicationService.deletePublication(publication.id);
      navigate("/publications");
    } catch (err) {
      setError("Error al eliminar la publicación.");
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    setStatusMsg("");
    try {
      const res = await publicationService.addComment(publication.id, newComment.trim());
      setComments((prev) => [res, ...prev]);
      setNewComment("");
    } catch (err) {
      setStatusMsg("Error al enviar el comentario.");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      await publicationService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setStatusMsg("Error al borrar comentario.");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mariner-600 dark:border-mariner-400"></div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto my-8 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-sm font-semibold text-mariner-900 dark:text-zinc-100">{error || "Publicación no encontrada."}</p>
        <button
          onClick={() => navigate("/publications")}
          className="px-4 py-2 bg-mariner-600 text-white rounded-xl text-xs font-semibold"
        >
          Volver a publicaciones
        </button>
      </div>
    );
  }

  const isArticle = publication.publication_type === "ARTICLE";
  const writer = publication.writer || {};
  const writerName = writer.user?.name || writer.nick_name || "Autor";
  const writerAvatar = writer.avatar || "";
  const sanitizedContent = DOMPurify.sanitize(publication.content || "");

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 space-y-6">
      {/* Botón Volver */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-mariner-600 dark:text-zinc-400 hover:text-mariner-800 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al feed
      </button>

      {/* Artículo / Foro Principal */}
      <article className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl p-6 md:p-10 shadow-xs space-y-6">
        {/* Header Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mariner-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isArticle
                  ? "bg-mariner-100 text-mariner-800 dark:bg-mariner-950/60 dark:text-mariner-300 border border-mariner-200 dark:border-mariner-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              }`}
            >
              {isArticle ? <FileText className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
              <span>{isArticle ? "Artículo" : "Foro de Debate"}</span>
            </span>

            {publication.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-mariner-50 dark:bg-zinc-800 text-mariner-600 dark:text-zinc-400 border border-mariner-100 dark:border-zinc-700">
                <Folder className="w-3.5 h-3.5 text-mariner-400" />
                <span>{publication.category.name}</span>
              </span>
            )}
          </div>

          {/* Botones de autoría (Editar / Eliminar) */}
          {isAuthor && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/publications/${publication.id}/edit`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-mariner-50 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-300 hover:bg-mariner-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Editar
              </button>
              <button
                onClick={handleDeletePublication}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Título */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-mariner-950 dark:text-zinc-50 leading-tight tracking-tight">
          {publication.title}
        </h1>

        {/* Info Autor y Fecha */}
        <div className="flex items-center gap-3 py-2">
          {writerAvatar ? (
            <img src={writerAvatar} alt={writerName} className="w-10 h-10 rounded-2xl object-cover border border-mariner-100 dark:border-zinc-800" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-mariner-600 text-white flex items-center justify-center font-bold text-sm">
              {(writer.nick_name || "?").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-mariner-900 dark:text-zinc-100">{writerName}</p>
            <p className="text-[11px] text-mariner-400 dark:text-zinc-500">
              Publicado el {new Date(publication.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Cuerpo Sanitizado */}
        <div
          className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-mariner-900 dark:text-zinc-200 border-t border-b border-mariner-100 dark:border-zinc-800/80 py-6"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Galería de Imágenes Adjuntas */}
        {publication.images && publication.images.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-mariner-700 dark:text-zinc-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-mariner-500" /> Archivos de Imagen Adjuntos ({publication.images.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {publication.images.map((img) => (
                <a
                  key={img.id}
                  href={img.absolute_url || img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl overflow-hidden border border-mariner-100 dark:border-zinc-800 bg-mariner-50 dark:bg-zinc-800 aspect-video flex items-center justify-center"
                >
                  <img
                    src={img.absolute_url || img.url}
                    alt={img.caption || "Imagen adjunta"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {img.caption && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                      {img.caption}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Sección de Debate / Comentarios */}
      <section className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-mariner-950 dark:text-zinc-50 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-mariner-600" /> Debate y Comentarios ({comments.length})
        </h3>

        {statusMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-xl">
            {statusMsg}
          </div>
        )}

        {/* Formulario para comentar */}
        {user ? (
          <form onSubmit={handleAddComment} className="flex gap-2 items-start">
            <textarea
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu aporte o pregunta al debate..."
              className="flex-1 px-4 py-3 bg-mariner-50/50 dark:bg-zinc-800/60 border border-mariner-200 dark:border-zinc-700 rounded-2xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500"
            />
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="p-3 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 text-white rounded-2xl transition-colors disabled:opacity-40 flex-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <p className="text-xs text-mariner-500 dark:text-zinc-400">
            Debes <a href="/signin" className="text-mariner-600 font-semibold underline">iniciar sesión</a> para participar en los comentarios.
          </p>
        )}

        {/* Lista de Comentarios */}
        <div className="space-y-4 pt-2">
          {comments.length === 0 ? (
            <p className="text-xs text-mariner-400 dark:text-zinc-500 text-center py-6">
              Aún no hay comentarios. ¡Sé el primero en aportar a la discusión!
            </p>
          ) : (
            comments.map((c) => {
              const commWriter = c.writer || c.educator || {};
              const commName = commWriter.user?.name || commWriter.nick_name || "Docente";
              const commAvatar = commWriter.avatar || "";
              const canDeleteComm = user && (user.id === commWriter.user?.id || user.id === commWriter.id || user.role === "ADMIN");

              return (
                <div
                  key={c.id}
                  className="p-4 bg-mariner-50/40 dark:bg-zinc-800/40 border border-mariner-100 dark:border-zinc-800 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {commAvatar ? (
                        <img src={commAvatar} alt={commName} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-mariner-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {(commWriter.nick_name || "?").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-bold text-mariner-900 dark:text-zinc-100">{commName}</span>
                      <span className="text-[10px] text-mariner-400 dark:text-zinc-500">
                        {new Date(c.created_at).toLocaleDateString("es-CO")}
                      </span>
                    </div>

                    {canDeleteComm && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        title="Eliminar comentario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-mariner-800 dark:text-zinc-200 leading-relaxed pl-8">
                    {c.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
