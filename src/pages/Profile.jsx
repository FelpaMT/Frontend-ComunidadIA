import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/StatusMessage";

const inputClass =
  "w-full px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 focus:border-transparent text-sm transition-colors";

function FieldUpdate({ label, value, placeholder, type = "text", onSave, loading }) {
  const [val, setVal] = useState(value || "");
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-mariner-700 dark:text-zinc-400">{label}</label>
      <div className="flex gap-2">
        <input
          className={inputClass + " flex-1"}
          type={type}
          placeholder={placeholder}
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <button
          type="button"
          disabled={loading || !val}
          onClick={() => onSave(val)}
          className="px-3 py-2 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    api
      .get("/api/educator/me")
      .then((res) => setProfile(res.data))
      .catch(() => setStatus({ type: "error", message: "Error cargando tu perfil." }))
      .finally(() => setLoading(false));
  }, []);

  async function updateField(body) {
    setUpdating(true);
    setStatus({ type: "info", message: "" });
    try {
      const res = await api.put("/api/educator/me/update", body);
      setProfile(res.data);
      setStatus({ type: "success", message: "Actualizado correctamente." });
    } catch {
      setStatus({ type: "error", message: "Error al actualizar." });
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeletePublication(id) {
    if (!window.confirm("¿Eliminar esta publicación?")) return;
    try {
      await api.delete(`/api/publication/me/${id}`);
      setProfile((prev) => ({
        ...prev,
        publications: prev.publications.filter((p) => p.id !== id),
      }));
      setStatus({ type: "success", message: "Publicación eliminada." });
    } catch {
      setStatus({ type: "error", message: "Error eliminando la publicación." });
    }
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    if (!deletePassword) return;
    if (!window.confirm("¿Seguro que quieres eliminar tu cuenta? Esta acción es irreversible.")) return;
    try {
      await api.put("/api/educator/me/delete", { password: deletePassword });
      await logout();
      navigate("/inicio");
    } catch (err) {
      const code = err.response?.status;
      setStatus({
        type: "error",
        message: code === 400 ? "Contraseña incorrecta." : "Error eliminando la cuenta.",
      });
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-8 text-sm text-mariner-400 dark:text-zinc-500">
        Cargando...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-8">
        <StatusMessage type={status.type} message={status.message} />
      </div>
    );
  }

  const initials = (profile.nick_name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      {/* Profile header */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-200 flex items-center justify-center text-xl font-bold flex-none">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-mariner-950 dark:text-zinc-50">
              Mi perfil
            </h2>
            <p className="text-sm text-mariner-500 dark:text-zinc-400">
              @{profile.nick_name} · {profile.user.email}
            </p>
          </div>
        </div>

        <StatusMessage type={status.type} message={status.message} />

        <div className="flex flex-col gap-3">
          <FieldUpdate
            label="Nickname"
            value={profile.nick_name}
            placeholder="Nuevo nickname"
            onSave={(v) => updateField({ nick_name: v })}
            loading={updating}
          />
          <FieldUpdate
            label="Nombre completo"
            value={profile.user.name}
            placeholder="Nuevo nombre"
            onSave={(v) => updateField({ name: v })}
            loading={updating}
          />
          <FieldUpdate
            label="Email"
            value={profile.user.email}
            placeholder="Nuevo email"
            type="email"
            onSave={(v) => updateField({ email: v })}
            loading={updating}
          />
        </div>
      </div>

      {/* My publications */}
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-mariner-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-mariner-900 dark:text-zinc-100">
            Mis publicaciones ({profile.publications?.length ?? 0})
          </h3>
        </div>

        {!profile.publications?.length ? (
          <p className="text-sm text-mariner-400 dark:text-zinc-500 px-5 py-4">
            Aún no tienes publicaciones.
          </p>
        ) : (
          <ul className="divide-y divide-mariner-50 dark:divide-zinc-800">
            {profile.publications.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-mariner-900 dark:text-zinc-100 truncate">
                    {p.title}
                  </p>
                  <p className="text-xs text-mariner-400 dark:text-zinc-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-none">
                  <button
                    onClick={() => navigate(`/publications/${p.id}`)}
                    className="p-1.5 rounded-lg text-mariner-500 hover:bg-mariner-50 dark:hover:bg-zinc-800 transition-colors"
                    title="Ver"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => navigate(`/publications/${p.id}/edit`)}
                    className="p-1.5 rounded-lg text-mariner-500 hover:bg-mariner-50 dark:hover:bg-zinc-800 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeletePublication(p.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
          Zona peligrosa
        </h3>
        <p className="text-xs text-mariner-500 dark:text-zinc-400 mb-3">
          Esta acción es permanente e irreversible.
        </p>
        <form onSubmit={handleDeleteAccount} className="flex gap-2 max-w-sm">
          <input
            className={inputClass + " flex-1"}
            type="password"
            placeholder="Contraseña actual"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
          <button
            type="submit"
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Eliminar cuenta
          </button>
        </form>
      </div>
    </div>
  );
}
