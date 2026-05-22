import React from "react";

export default function UserCard({ user, onDetail, onToggleFollow, loadingFollow }) {
  const initials = (user.nick_name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-mariner-50 dark:hover:bg-zinc-800/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-200 flex items-center justify-center text-sm font-bold flex-none">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-mariner-950 dark:text-zinc-50">
          {user.nick_name}
        </div>
        <div className="text-xs text-mariner-500 dark:text-zinc-400 truncate">
          {user.user.name} · {user.user.email}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-none">
        <button
          onClick={onDetail}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-mariner-200 dark:border-zinc-700 text-mariner-600 dark:text-zinc-400 hover:bg-mariner-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Ver perfil
        </button>
        <button
          onClick={onToggleFollow}
          disabled={loadingFollow}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
            user.followed_by_me
              ? "bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-200 hover:bg-mariner-200 dark:hover:bg-zinc-700"
              : "bg-mariner-600 dark:bg-mariner-500 text-white hover:bg-mariner-700 dark:hover:bg-mariner-400"
          }`}
        >
          {user.followed_by_me ? "Siguiendo" : "Seguir"}
        </button>
      </div>
    </div>
  );
}
