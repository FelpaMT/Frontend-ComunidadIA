import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import api from "../api/client";
import StatusMessage from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";
import ChatBot from "../components/ChatBot";

export default function PublicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [publication, setPublication] = useState(null);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  async function fetchPublication() {
    setLoading(true);
    try {
      const res = await api.get(`/api/publications/${id}`);
      setPublication(res.data);
    } catch (err) {
      const code = err.response?.status;
      setStatus({
        type: "error",
        message: code === 404 ? "Publicación no encontrada." : "Error cargando la publicación.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPublication(); }, [id]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!comment) return;
    setSendingComment(true);
    try {
      const res = await api.post(`/api/commentary/me/${id}`, { content: comment });
      setStatus({ type: "success", message: "Comentario agregado." });
      setComment("");
      setPublication((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), res.data],
      }));
    } catch (err) {
      const code = err.response?.status;
      setStatus({
        type: "error",
        message: code === 400 ? "Comentario inválido." : "Error agregando el comentario.",
      });
    } finally {
      setSendingComment(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-8 text-sm text-mariner-400 dark:text-zinc-500">
        Cargando publicación...
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-8">
        <StatusMessage type={status.type} message={status.message} />
      </div>
    );
  }

  const created = new Date(publication.created_at);
  const isOwner = user?.id && publication.writer?.id === user.id;
  const initials = (publication.writer?.nick_name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      {/* Article */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-mariner-100 dark:border-zinc-800">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-mariner-500 dark:text-zinc-400 hover:text-mariner-700 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={15} />
            Volver
          </button>
          {isOwner && (
            <button
              onClick={() => navigate(`/publications/${id}/edit`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-mariner-200 dark:border-zinc-700 text-mariner-600 dark:text-zinc-400 hover:bg-mariner-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Pencil size={13} />
              Editar
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          <StatusMessage type={status.type} message={status.message} />

          {/* Author meta */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-200 flex items-center justify-center text-xs font-bold flex-none">
              {initials}
            </div>
            <div>
              <button
                onClick={() => navigate(`/users/${publication.writer.id}`)}
                className="text-sm font-semibold text-mariner-700 dark:text-zinc-400 hover:text-mariner-900 dark:hover:text-zinc-100 transition-colors"
              >
                @{publication.writer.nick_name}
              </button>
              <div className="flex items-center gap-2 text-xs text-mariner-500 dark:text-zinc-400">
                <span>{created.toLocaleDateString()}</span>
                {publication.category && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-200 border border-mariner-200 dark:border-zinc-700">
                    {publication.category.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-mariner-950 dark:text-zinc-50 mb-5 leading-snug">
            {publication.title}
          </h1>

          <article
            className="html-viewer text-mariner-800 dark:text-zinc-200 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: publication.content || "" }}
          />
        </div>
      </div>

      {/* AI Chat with publication context */}
      <ChatBot
        title="Pregúntale a la IA sobre esta publicación"
        contextHtml={publication.content || ""}
      />

      {/* Comments */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-mariner-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-mariner-900 dark:text-zinc-100">
            Comentarios ({publication.comments?.length ?? 0})
          </h2>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {publication.comments?.length === 0 ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500">
              Aún no hay comentarios.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {publication.comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-mariner-50 dark:bg-zinc-800 border border-mariner-100 dark:border-zinc-700 rounded-lg px-4 py-3"
                >
                  <div className="text-xs text-mariner-400 dark:text-zinc-500 mb-1">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm text-mariner-800 dark:text-zinc-200">
                    {c.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddComment} className="flex flex-col gap-2 pt-2 border-t border-mariner-100 dark:border-zinc-800">
            <textarea
              className="w-full px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 text-sm min-h-[90px] resize-y transition-colors"
              placeholder="Escribe un comentario..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              type="submit"
              disabled={sendingComment}
              className="self-start px-4 py-2 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingComment ? "Enviando..." : "Agregar comentario"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
