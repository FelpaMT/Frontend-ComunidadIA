import React from "react";

const styles = {
  success: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
  error:   "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  info:    "bg-mariner-50 dark:bg-zinc-900/30 text-mariner-700 dark:text-zinc-400 border border-mariner-200 dark:border-zinc-700",
};

export default function StatusMessage({ type = "info", message }) {
  if (!message) return null;
  return (
    <div className={`px-3 py-2 rounded-lg text-sm mb-3 ${styles[type] ?? styles.info}`}>
      {message}
    </div>
  );
}
