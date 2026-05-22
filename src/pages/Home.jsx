import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, BookOpen, Users } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import PublicationCard from "../components/PublicationCard";
import StatusMessage from "../components/StatusMessage";
import ChatBot from "../components/ChatBot";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const resFollowing = await api.get("/api/subscription/me/following", {
          params: { limit: 50, offset: 0 },
        });
        const following = resFollowing.data || [];
        const allPubs = [];
        for (const f of following) {
          const resPubs = await api.get(`/api/publication/by-user/${f.user.id}`, {
            params: { limit: 10, offset: 0 },
          });
          (resPubs.data || []).forEach((p) => allPubs.push(p));
        }
        allPubs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPublications(allPubs);
      } catch (err) {
        const code = err.response?.status;
        setStatus({
          type: "error",
          message:
            code === 401
              ? "Tu sesión ha expirado. Vuelve a iniciar sesión."
              : "Error cargando publicaciones de tus suscripciones.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome card */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-mariner-950 dark:text-zinc-50 mb-1">
          Hola, {user?.nick_name || user?.name || "docente"}
        </h1>
        <p className="text-sm text-mariner-500 dark:text-zinc-400 mb-4">
          Explora artículos sobre IA en educación, sigue a otros docentes y comparte tus experiencias.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate("/create-publication")}
            className="flex items-center gap-1.5 px-4 py-2 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusCircle size={15} />
            Nueva publicación
          </button>
          <button
            onClick={() => navigate("/publications")}
            className="flex items-center gap-1.5 px-4 py-2 border border-mariner-200 dark:border-zinc-700 text-mariner-700 dark:text-zinc-400 hover:bg-mariner-50 dark:hover:bg-zinc-800 text-sm font-medium rounded-lg transition-colors"
          >
            <BookOpen size={15} />
            Explorar
          </button>
          <button
            onClick={() => navigate("/subscriptions")}
            className="flex items-center gap-1.5 px-4 py-2 border border-mariner-200 dark:border-zinc-700 text-mariner-700 dark:text-zinc-400 hover:bg-mariner-50 dark:hover:bg-zinc-800 text-sm font-medium rounded-lg transition-colors"
          >
            <Users size={15} />
            Suscripciones
          </button>
        </div>
      </div>

      {/* AI Chatbot */}
      <ChatBot title="Asistente de IA Educativa" />

      {/* Feed */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-mariner-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-mariner-900 dark:text-zinc-100">
            Publicaciones de docentes que sigues
          </h2>
        </div>

        <div className="p-2">
          <StatusMessage type={status.type} message={status.message} />

          {loading ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 px-3 py-4">
              Cargando publicaciones...
            </p>
          ) : publications.length === 0 ? (
            <p className="text-sm text-mariner-400 dark:text-zinc-500 px-3 py-4">
              Aún no hay publicaciones de docentes que sigues.
            </p>
          ) : (
            publications.map((p) => (
              <PublicationCard
                key={p.id}
                publication={p}
                onClick={() => navigate(`/publications/${p.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
