import React from "react";

export default function PublicationCard({ publication, onClick }) {
  const created = new Date(publication.created_at);
  const nick = publication.writer?.nick_name || "?";
  const initials = nick.slice(0, 2).toUpperCase();

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-mariner-100/60 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-200 flex items-center justify-center text-xs font-bold flex-none select-none">
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-mariner-950 dark:text-zinc-50 line-clamp-2 group-hover:text-mariner-700 dark:group-hover:text-mariner-200 leading-snug">
          {publication.title}
        </h3>
        <div className="flex items-center flex-wrap gap-1.5 mt-1">
          <span className="text-xs text-mariner-500 dark:text-zinc-400">
            @{nick}
          </span>
          <span className="text-xs text-mariner-300 dark:text-mariner-600">·</span>
          <span className="text-xs text-mariner-500 dark:text-zinc-400">
            {created.toLocaleDateString()}
          </span>
          {publication.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-200 border border-mariner-200 dark:border-zinc-700">
              {publication.category.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
