import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/StatusMessage";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await api.get("/api/educator/me");
        setProfile(res.data);
      } catch (err) {
        setStatus({
          type: "error",
          message: "Error cargando tu perfil.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setUpdating(true);
    setStatus({ type: "info", message: "" });
    try {
      const body = {
        nick_name: profile.nick_name,
        name: profile.user.name,
        email: profile.user.email,
      };
      const res = await api.put("/api/educator/me/update", body);
      setProfile(res.data);
      setStatus({
        type: "success",
        message: "Perfil actualizado correctamente.",
      });
    } catch (err) {
      const code = err.response?.status;
      setStatus({
        type: "error",
        message:
          code === 400
            ? "Datos inválidos."
            : "Error actualizando el perfil.",
      });
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    if (!deletePassword) return;
    const confirm = window.confirm(
      "¿Seguro que quieres eliminar tu cuenta? Esta acción es irreversible."
    );
    if (!confirm) return;
    try {
      await api.put("/api/educator/me/delete", { password: deletePassword });
      setStatus({
        type: "success",
        message: "Cuenta eliminada. Cerrando sesión...",
      });
      await logout();
      navigate("/inicio");
    } catch (err) {
      const code = err.response?.status;
      setStatus({
        type: "error",
        message:
          code === 400
            ? "Contraseña incorrecta."
            : "Error eliminando la cuenta.",
      });
    }
  }

  async function handleDeletePublication(id) {
    const ok = window.confirm("¿Eliminar esta publicación?");
    if (!ok) return;
    try {
      await api.delete(`/api/publication/me/${id}`);
      setProfile((prev) => ({
        ...prev,
        publications: prev.publications.filter((p) => p.id !== id),
      }));
      setStatus({
        type: "success",
        message: "Publicación eliminada.",
      });
    } catch {
      setStatus({
        type: "error",
        message: "Error eliminando la publicación.",
      });
    }
  }

  async function handleUpdatePublication(pub) {
    const newTitle = prompt("Nuevo título", pub.title);
    if (!newTitle) return;
    const newContent = prompt(
      "Nuevo contenido (texto plano, se guardará como <p>texto</p>)",
      "Actualiza luego con el editor de crear publicación."
    );
    const body = {
      title: newTitle,
      publication_type: "ARTICLE",
      content: `<p>${newContent}</p>`,
    };
    try {
      await api.put(`/api/publication/me/update/${pub.id}`, body);
      setStatus({
        type: "success",
        message: "Publicación actualizada.",
      });
    } catch {
      setStatus({
        type: "error",
        message: "Error actualizando la publicación.",
      });
    }
  }

  if (loading) return <div>Cargando...</div>;
  if (!profile) return <div>No se pudo cargar el perfil.</div>;

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <div className="card">
        <h2 className="page-title">Mi perfil</h2>
        <StatusMessage type={status.type} message={status.message} />
        {/* === Actualizar nickname === */}
        <div className="card">
        <h3 className="page-title" style={{ fontSize: "1.1rem" }}>Actualizar Nickname</h3>

        <div style={{ marginBottom: "0.4rem", opacity: 0.8 }}>
            <strong>Actual:</strong> {profile.nick_name}
        </div>

        <input
            className="input"
            placeholder="Nuevo nickname"
            value={profile.newNick || ""}
            onChange={(e) =>
            setProfile({ ...profile, newNick: e.target.value })
            }
            style={{ marginBottom: "0.6rem" }}
        />

        <button
            type="button"
            className="btn btn-primary"
            disabled={updating}
            onClick={async () => {
            if (!profile.newNick) return;
            setUpdating(true);
            try {
                const res = await api.put("/api/educator/me/update", {
                nick_name: profile.newNick,
                });
                setProfile({
                ...res.data,
                newNick: "",
                });
                setStatus({
                type: "success",
                message: "Nickname actualizado.",
                });
            } catch {
                setStatus({
                type: "error",
                message: "Error actualizando nickname.",
                });
            } finally {
                setUpdating(false);
            }
            }}
        >
            Actualizar nickname
        </button>
        </div>

        {/* === Actualizar nombre === */}
        <div className="card">
        <h3 className="page-title" style={{ fontSize: "1.1rem" }}>Actualizar Nombre</h3>

        <div style={{ marginBottom: "0.4rem", opacity: 0.8 }}>
            <strong>Actual:</strong> {profile.user.name}
        </div>

        <input
            className="input"
            placeholder="Nuevo nombre"
            value={profile.newName || ""}
            onChange={(e) =>
            setProfile({ ...profile, newName: e.target.value })
            }
            style={{ marginBottom: "0.6rem" }}
        />

        <button
            type="button"
            className="btn btn-primary"
            disabled={updating}
            onClick={async () => {
            if (!profile.newName) return;
            setUpdating(true);
            try {
                const res = await api.put("/api/educator/me/update", {
                name: profile.newName,
                });
                setProfile({
                ...res.data,
                newName: "",
                });
                setStatus({
                type: "success",
                message: "Nombre actualizado.",
                });
            } catch {
                setStatus({
                type: "error",
                message: "Error actualizando el nombre.",
                });
            } finally {
                setUpdating(false);
            }
            }}
        >
            Actualizar nombre
        </button>
        </div>

        {/* === Actualizar email === */}
        <div className="card">
        <h3 className="page-title" style={{ fontSize: "1.1rem" }}>Actualizar Email</h3>

        <div style={{ marginBottom: "0.4rem", opacity: 0.8 }}>
            <strong>Actual:</strong> {profile.user.email}
        </div>

        <input
            className="input"
            type="email"
            placeholder="Nuevo email"
            value={profile.newEmail || ""}
            onChange={(e) =>
            setProfile({ ...profile, newEmail: e.target.value })
            }
            style={{ marginBottom: "0.6rem" }}
        />

        <button
            type="button"
            className="btn btn-primary"
            disabled={updating}
            onClick={async () => {
            if (!profile.newEmail) return;
            setUpdating(true);
            try {
                const res = await api.put("/api/educator/me/update", {
                email: profile.newEmail,
                });
                setProfile({
                ...res.data,
                newEmail: "",
                });
                setStatus({
                type: "success",
                message: "Email actualizado.",
                });
            } catch {
                setStatus({
                type: "error",
                message: "Error actualizando el email.",
                });
            } finally {
                setUpdating(false);
            }
            }}
        >
            Actualizar email
        </button>
        </div>

      </div>

      <div className="card">
        <h3 className="page-title" style={{ fontSize: "1.2rem" }}>
          Mis publicaciones
        </h3>
        {profile.publications?.length === 0 ? (
          <div style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
            Aún no tienes publicaciones.
          </div>
        ) : (
          <div className="grid" style={{ gap: "0.8rem" }}>
            {(profile.publications ?? []).map((p) => (
              <div
                key={p.id}
                className="card"
                style={{ padding: "0.8rem", background: "rgba(15,23,42,0.7)" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#9ca3af",
                        marginBottom: 4,
                      }}
                    >
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                    <div>{p.title}</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexDirection: "column",
                    }}
                  >
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => navigate(`/publications/${p.id}`)}
                    >
                      Ver
                    </button>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => navigate(`/publications/${p.id}/edit`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => handleDeletePublication(p.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card">
        <h3 className="page-title" style={{ fontSize: "1.2rem" }}>
          Eliminar cuenta
        </h3>
        <p className="page-subtitle">
          Esta acción es permanente. Se te pedirá tu contraseña actual.
        </p>
        <form
          onSubmit={handleDeleteAccount}
          className="grid"
          style={{ gap: "0.7rem", maxWidth: 360 }}
        >
          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
          <button className="btn btn-danger" type="submit">
            Eliminar cuenta
          </button>
        </form>
      </div>
    </div>
  );
}
