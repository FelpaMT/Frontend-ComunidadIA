import React from "react";
import { useNavigate } from "react-router-dom";
import { Building, Award, Users } from "lucide-react";
import SubscribeButton from "./SubscribeButton";

export default function EducatorCard({ educator, onFollowChange }) {
  const navigate = useNavigate();
  if (!educator) return null;

  const user = educator.user || {};
  const initials = (educator.nick_name || user.name || "?").slice(0, 2).toUpperCase();
  const isFollowing = educator.is_following || educator.followed_by_me || false;

  return (
    <div
      onClick={() => navigate(`/users/${educator.id}`)}
      className="group w-full min-w-0 overflow-hidden bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 hover:border-mariner-300 dark:hover:border-zinc-700 rounded-2xl p-5 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between gap-4"
    >
      <div className="flex items-start gap-4 min-w-0">
        {/* Avatar / Iniciales */}
        {educator.avatar ? (
          <img
            src={educator.avatar}
            alt={educator.nick_name}
            className="w-14 h-14 rounded-2xl object-cover border border-mariner-100 dark:border-zinc-800 flex-none"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mariner-500 to-mariner-700 text-white flex items-center justify-center font-bold text-lg flex-none shadow-xs">
            {initials}
          </div>
        )}

        {/* Info Educador */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-mariner-950 dark:text-zinc-50 truncate group-hover:text-mariner-600 dark:group-hover:text-mariner-400 transition-colors">
            {user.name || educator.nick_name}
          </h3>
          <p className="text-xs font-medium text-mariner-500 dark:text-zinc-400 truncate">
            @{educator.nick_name}
          </p>

          {/* Especialidad e Institución */}
          <div className="mt-2 flex flex-col gap-1 text-xs text-mariner-600 dark:text-zinc-400 min-w-0">
            {educator.specialty && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Award className="w-3.5 h-3.5 text-mariner-500 flex-none" />
                <span className="truncate">{educator.specialty}</span>
              </div>
            )}
            {educator.institution && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Building className="w-3.5 h-3.5 text-mariner-400 flex-none" />
                <span className="truncate">{educator.institution}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Biografía Corta */}
      {educator.bio && (
        <p className="text-xs text-mariner-600 dark:text-zinc-400 line-clamp-2 leading-relaxed break-words min-w-0">
          {educator.bio}
        </p>
      )}

      {/* Métricas y Botón de Suscripción */}
      <div className="pt-3 border-t border-mariner-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 mt-auto min-w-0">
        <div className="flex items-center gap-2 text-xs text-mariner-500 dark:text-zinc-400 font-medium min-w-0">
          <span className="flex items-center gap-1 truncate">
            <Users className="w-3.5 h-3.5 text-mariner-500 shrink-0" />
            <strong className="text-mariner-900 dark:text-zinc-200">
              {educator.followers_count || 0}
            </strong>{" "}
            <span className="truncate">seguidores</span>
          </span>
        </div>

        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <SubscribeButton
            educatorId={educator.id}
            isFollowing={isFollowing}
            onToggleSuccess={onFollowChange}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
