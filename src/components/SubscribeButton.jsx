import React, { useState } from "react";
import { UserCheck, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { educatorService } from "../services/educatorService";

export default function SubscribeButton({
  educatorId,
  isFollowing: initialIsFollowing = false,
  onToggleSuccess,
  size = "md"
}) {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  // Ocultar si es el propio perfil
  if (user && (user.id === educatorId || user.educator_id === educatorId)) {
    return null;
  }

  async function handleToggle(e) {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = "/signin";
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!previousState); // Cambio optimista
    setLoading(true);

    try {
      const res = await educatorService.toggleSubscription(educatorId, previousState);
      const newState = res.is_following !== undefined ? res.is_following : !previousState;
      setIsFollowing(newState);
      if (onToggleSuccess) {
        onToggleSuccess(newState);
      }
    } catch (err) {
      setIsFollowing(previousState); // Revertir en caso de error
    } finally {
      setLoading(false);
    }
  }

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3.5 py-1.5 text-xs font-semibold gap-1.5",
    lg: "px-5 py-2.5 text-sm font-semibold gap-2"
  }[size] || "px-3.5 py-1.5 text-xs font-semibold gap-1.5";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer ${sizeClasses} ${
        isFollowing
          ? "bg-mariner-100 hover:bg-red-50 text-mariner-800 hover:text-red-600 border border-mariner-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-900"
          : "bg-mariner-600 hover:bg-mariner-700 text-white dark:bg-mariner-500 dark:hover:bg-mariner-400"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-3.5 h-3.5 text-mariner-600 dark:text-zinc-300" />
          <span>Siguiendo</span>
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          <span>Seguir</span>
        </>
      )}
    </button>
  );
}
