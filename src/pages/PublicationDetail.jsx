import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import StatusMessage from "../components/StatusMessage";

export default function PublicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [publication, setPublication] = useState(null);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);

  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  async function fetchPublication() {
    setLoading(true);
    setStatus({ type: "info", message: "" });

    try {
      const res = await api.get(`/api/publications/${id}`);
      setPublication(res.data);
    } catch (err) {
      const code = err.response?.status;
      setStatus({
        type: "error",
        message:
          code === 404
            ? "Publicación no encontrada."
            : "Error cargando la publicación.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPublication();
  }, [id]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!comment) return;

    setSendingComment(true);
    setStatus({ type: "info", message: "" });

    try {
      const res = await api.post(`/api/commentary/me/${id}`, {
        content: comment,
      });

      setStatus({
        type: "success",
        message: "Comentario agregado.",
      });

      setComment("");

      setPublication((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), res.data],
      }));
    } catch (err) {
      const code = err.response?.status;

      setStatus({
        type: "error",
        message:
          code === 400
            ? "Comentario inválido."
            : "Error agregando el comentario.",
      });
    } finally {
      setSendingComment(false);
    }
  }

  if (loading) return <div className="article-loading">Cargando publicación...</div>;
  if (!publication) return <div className="article-error">No se pudo cargar la publicación.</div>;

  const created = new Date(publication.created_at);

  return (
    <div className="article">

      <StatusMessage type={status.type} message={status.message} />

      {/* ================================
          ENCABEZADO DEL ARTÍCULO
         ================================= */}
      <header className="article-header">

        <div className="article-meta">
          <span>{created.toLocaleDateString()}</span>
          <span>·</span>
          <span 
            className="article-author"
            onClick={() => navigate(`/users/${publication.writer.id}`)}
          >
            {publication.writer.nick_name}
          </span>
        </div>

        <h1 className="article-title">{publication.title}</h1>
      </header>

      {/* ================================
          CONTENIDO DEL ARTÍCULO
         ================================= */}
      <article 
        className="article-body html-viewer"
        dangerouslySetInnerHTML={{ __html: publication.content || "" }}
      />

      {/* ================================
          SECCIÓN DE COMENTARIOS
         ================================= */}
      <section className="article-comments">

        <h2 className="comments-title">Comentarios</h2>

        {publication.comments?.length === 0 ? (
          <div className="comments-empty">
            Aún no hay comentarios.
          </div>
        ) : (
          <div className="comments-list">
            {publication.comments.map((c) => (
              <div key={c.id} className="comment-item">
                
                <div className="comment-meta">
                  {new Date(c.created_at).toLocaleString()}
                </div>

                <div className="comment-content">
                  {c.content}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Formulario de comentario */}
        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            className="textarea"
            placeholder="Escribe un comentario..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={sendingComment}
          >
            {sendingComment ? "Enviando..." : "Agregar comentario"}
          </button>
        </form>
      </section>
    </div>
  );
}
