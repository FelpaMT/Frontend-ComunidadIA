import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Folder, MessageCircle, Image as ImageIcon } from "lucide-react";

export default function PublicationCard({ publication, onClick }) {
  const navigate = useNavigate();
  if (!publication) return null;

  const handleClick = () => {
    if (onClick) onClick();
    else navigate(`/publications/${publication.id}`);
  };

  const created = new Date(publication.created_at);
  const formattedDate = created.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const writer = publication.writer || {};
  const nick = writer.nick_name || publication.educator?.nick_name || "?";
  const avatar = writer.avatar || publication.educator?.avatar || "";
  const initials = nick.slice(0, 2).toUpperCase();

  const isArticle = publication.publication_type === "ARTICLE";

  return (
    <div
      onClick={handleClick}
      className="group bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 hover:border-mariner-300 dark:hover:border-zinc-700 rounded-2xl p-5 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between gap-3"
    >
      {/* Top Header: Tipo, Categoria y Fecha */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              isArticle
                ? "bg-mariner-100 text-mariner-800 dark:bg-mariner-950/60 dark:text-mariner-300 border border-mariner-200 dark:border-mariner-800"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            }`}
          >
            {isArticle ? (
              <>
                <FileText className="w-3 h-3 text-mariner-600 dark:text-mariner-400" />
                <span>Artículo</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Foro</span>
              </>
            )}
          </span>

          {publication.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-mariner-50 dark:bg-zinc-800 text-mariner-600 dark:text-zinc-400 border border-mariner-100 dark:border-zinc-700">
              <Folder className="w-3 h-3 text-mariner-400" />
              <span>{publication.category.name}</span>
            </span>
          )}
        </div>

        <span className="text-xs text-mariner-400 dark:text-zinc-500 font-medium">
          {formattedDate}
        </span>
      </div>

      {/* Titulo */}
      <h3 className="text-base font-bold text-mariner-950 dark:text-zinc-50 group-hover:text-mariner-600 dark:group-hover:text-mariner-400 transition-colors line-clamp-2 leading-snug">
        {publication.title}
      </h3>

      {/* Footer: Autor e Interacciones */}
      <div className="pt-3 border-t border-mariner-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {avatar ? (
            <img
              src={avatar}
              alt={nick}
              className="w-6 h-6 rounded-full object-cover border border-mariner-100 dark:border-zinc-800 flex-none"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-mariner-600 text-white flex items-center justify-center font-bold text-[10px] flex-none">
              {initials}
            </div>
          )}
          <span className="font-semibold text-mariner-700 dark:text-zinc-300 truncate">
            @{nick}
          </span>
        </div>

        <div className="flex items-center gap-3 text-mariner-500 dark:text-zinc-400 font-medium flex-none">
          {publication.images_count > 0 && (
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-mariner-400" />
              <span>{publication.images_count}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5 text-mariner-400" />
            <span>{publication.comments_count || 0}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
