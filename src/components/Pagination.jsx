import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, onChange, disabled }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4 pt-4 pb-4 border-t border-mariner-100 dark:border-zinc-800">
      <button
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-mariner-200 dark:border-zinc-700 text-mariner-600 dark:text-zinc-400 hover:bg-mariner-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={15} />
        Anterior
      </button>

      <span className="text-sm text-mariner-500 dark:text-zinc-400 px-2">
        Pág. {page}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={disabled}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-mariner-200 dark:border-zinc-700 text-mariner-600 dark:text-zinc-400 hover:bg-mariner-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Siguiente
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
