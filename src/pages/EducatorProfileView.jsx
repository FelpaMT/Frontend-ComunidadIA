import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Award, Building, Globe, Link as LinkIcon, Users, BookOpen, UserCheck, ArrowLeft, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import educatorService from "../services/educatorService";
import SubscribeButton from "../components/SubscribeButton";
import PublicationCard from "../components/PublicationCard";
import EducatorCard from "../components/EducatorCard";

export default function EducatorProfileView() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [educator, setEducator] = useState(null);
  const [activeTab, setActiveTab] = useState("publications"); // 'publications' | 'followers' | 'following'
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const targetId = id || "me";
  const isOwnProfile = !id || (currentUser && currentUser.id === parseInt(id, 10));

  async function fetchProfileData() {
    setLoading(true);
    setError("");
    try {
      const data = await educatorService.getEducatorById(targetId);
      setEducator(data);
    } catch (err) {
      setError("No se encontró el perfil del educador solicitado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  useEffect(() => {
    if (activeTab === "followers" && educator?.id) {
      educatorService.getFollowers(educator.id).then(setFollowers).catch(() => {});
    } else if (activeTab === "following" && educator?.id) {
      educatorService.getFollowing(educator.id).then(setFollowing).catch(() => {});
    }
  }, [activeTab, educator?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mariner-600 dark:border-mariner-400"></div>
      </div>
    );
  }

  if (error || !educator) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
        <p className="text-sm text-red-500 mb-4">{error || "Educador no encontrado."}</p>
        <button
          onClick={() => navigate("/users")}
          className="px-4 py-2 bg-mariner-600 text-white rounded-xl text-xs font-semibold"
        >
          Volver al directorio
        </button>
      </div>
    );
  }

  const user = educator.user || {};
  const initials = (educator.nick_name || user.name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 space-y-6">
      {/* Botón Navegación */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-mariner-600 dark:text-zinc-400 hover:text-mariner-800 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* Cabecera del Perfil */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          {educator.avatar ? (
            <img
              src={educator.avatar}
              alt={educator.nick_name}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-zinc-800 shadow-md flex-none"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-mariner-500 to-mariner-700 text-white flex items-center justify-center font-extrabold text-3xl flex-none shadow-md">
              {initials}
            </div>
          )}

          {/* Información */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-mariner-950 dark:text-zinc-50 tracking-tight">
                  {user.name || educator.nick_name}
                </h1>
                <p className="text-sm font-semibold text-mariner-500 dark:text-zinc-400">
                  @{educator.nick_name}
                </p>
              </div>

              {/* Botón Acción (Editar o Suscribirse) */}
              {isOwnProfile ? (
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="px-4 py-2 bg-mariner-100 hover:bg-mariner-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-mariner-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Editar Perfil
                </button>
              ) : (
                <SubscribeButton
                  educatorId={educator.id}
                  isFollowing={educator.followed_by_me || educator.is_following}
                  onToggleSuccess={fetchProfileData}
                  size="lg"
                />
              )}
            </div>

            {/* Metadatos (Especialidad / Institución) */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-mariner-600 dark:text-zinc-400">
              {educator.specialty && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Award className="w-4 h-4 text-mariner-600" />
                  <span>{educator.specialty}</span>
                </div>
              )}
              {educator.institution && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Building className="w-4 h-4 text-mariner-500" />
                  <span>{educator.institution}</span>
                </div>
              )}
            </div>

            {/* Biografía */}
            {educator.bio && (
              <p className="mt-3 text-xs text-mariner-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
                {educator.bio}
              </p>
            )}

            {/* Enlaces Sociales & Métricas */}
            <div className="mt-4 pt-4 border-t border-mariner-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm">
                <button
                  onClick={() => setActiveTab("followers")}
                  className="hover:opacity-80 transition-opacity"
                >
                  <strong className="text-mariner-950 dark:text-zinc-50 font-bold">
                    {educator.followers_count || 0}
                  </strong>{" "}
                  <span className="text-xs text-mariner-500 dark:text-zinc-400">Seguidores</span>
                </button>
                <button
                  onClick={() => setActiveTab("following")}
                  className="hover:opacity-80 transition-opacity"
                >
                  <strong className="text-mariner-950 dark:text-zinc-50 font-bold">
                    {educator.following_count || 0}
                  </strong>{" "}
                  <span className="text-xs text-mariner-500 dark:text-zinc-400">Seguidos</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {educator.website && (
                  <a
                    href={educator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-mariner-50 dark:bg-zinc-800 text-mariner-600 dark:text-zinc-300 hover:text-mariner-800 transition-colors"
                    title="Sitio Web"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {educator.linkedin_url && (
                  <a
                    href={educator.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-mariner-50 dark:bg-zinc-800 text-mariner-600 dark:text-zinc-300 hover:text-mariner-800 transition-colors"
                    title="LinkedIn"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de Contenido */}
      <div className="flex border-b border-mariner-100 dark:border-zinc-800 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("publications")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "publications"
              ? "border-mariner-600 text-mariner-600 dark:border-mariner-400 dark:text-mariner-400"
              : "border-transparent text-mariner-400 hover:text-mariner-700 dark:text-zinc-500 dark:hover:text-zinc-300"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Publicaciones ({(educator.publications || []).length})
        </button>
        <button
          onClick={() => setActiveTab("followers")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "followers"
              ? "border-mariner-600 text-mariner-600 dark:border-mariner-400 dark:text-mariner-400"
              : "border-transparent text-mariner-400 hover:text-mariner-700 dark:text-zinc-500 dark:hover:text-zinc-300"
          }`}
        >
          <Users className="w-4 h-4" /> Seguidores ({educator.followers_count || 0})
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "following"
              ? "border-mariner-600 text-mariner-600 dark:border-mariner-400 dark:text-mariner-400"
              : "border-transparent text-mariner-400 hover:text-mariner-700 dark:text-zinc-500 dark:hover:text-zinc-300"
          }`}
        >
          <UserCheck className="w-4 h-4" /> Seguidos ({educator.following_count || 0})
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      {activeTab === "publications" && (
        <div className="space-y-4">
          {(educator.publications || []).length === 0 ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 text-center py-8">
              Este educador aún no ha publicado artículos ni foros.
            </p>
          ) : (
            educator.publications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))
          )}
        </div>
      )}

      {activeTab === "followers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followers.length === 0 ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 text-center col-span-2 py-8">
              Aún no cuenta con seguidores.
            </p>
          ) : (
            followers.map((f) => (
              <EducatorCard key={f.id} educator={f} onFollowChange={fetchProfileData} />
            ))
          )}
        </div>
      )}

      {activeTab === "following" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {following.length === 0 ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 text-center col-span-2 py-8">
              No sigue a ningún educador por ahora.
            </p>
          ) : (
            following.map((f) => (
              <EducatorCard key={f.id} educator={f} onFollowChange={fetchProfileData} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
