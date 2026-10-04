import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Award, Building, Globe, Link as LinkIcon, FileText, Camera, Save, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import educatorService from "../services/educatorService";

export default function EditProfileView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    nick_name: "",
    bio: "",
    institution: "",
    specialty: "",
    avatar: "",
    website: "",
    linkedin_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await educatorService.getEducatorById("me");
        setFormData({
          name: data.user?.name || data.name || "",
          nick_name: data.nick_name || "",
          bio: data.bio || "",
          institution: data.institution || "",
          specialty: data.specialty || "",
          avatar: data.avatar || "",
          website: data.website || "",
          linkedin_url: data.linkedin_url || "",
        });
      } catch (err) {
        setFeedback({ type: "error", message: "Error al cargar la información del perfil." });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      await educatorService.updateMyProfile(formData);
      setFeedback({ type: "success", message: "¡Perfil actualizado exitosamente!" });
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      const msg = err.response?.data?.detail || "Ocurrió un error al guardar los cambios.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mariner-600 dark:border-mariner-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      {/* Botón Volver */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-mariner-600 dark:text-zinc-400 hover:text-mariner-800 dark:hover:text-zinc-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al perfil
      </button>

      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-mariner-100 dark:border-zinc-800 bg-mariner-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-mariner-950 dark:text-zinc-50">Editar Perfil Profesional</h1>
            <p className="text-xs text-mariner-500 dark:text-zinc-400">Actualiza tus datos y presencia en la comunidad educativa.</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {feedback.message && (
            <div
              className={`p-4 rounded-2xl text-sm flex items-center gap-3 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-none" /> : <AlertCircle className="w-5 h-5 flex-none" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Avatar Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-mariner-50/40 dark:bg-zinc-800/40 rounded-2xl border border-mariner-100 dark:border-zinc-800">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Previsualización Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-mariner-200 dark:border-zinc-700 flex-none"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-mariner-600 text-white flex items-center justify-center font-bold text-2xl flex-none">
                {(formData.nick_name || user?.name || "IA").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-mariner-900 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> URL del Avatar / Fotografía
              </label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="https://ejemplo.com/tu-foto.jpg"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500"
              />
            </div>
          </div>

          {/* Campos Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-mariner-900 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Nombre Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mariner-900 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Usuario / Nickname
              </label>
              <input
                type="text"
                name="nick_name"
                value={formData.nick_name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500"
              />
            </div>
          </div>

          {/* Especialidad e Institución */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-mariner-900 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Especialidad / Área Docente
              </label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="Ej. IA en Educación Secundaria, Prompt Engineering..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mariner-900 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Institución Educativa
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="Universidad / Colegio / Instituto..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500"
              />
            </div>
          </div>

          {/* Biografía */}
          <div>
            <label className="block text-xs font-semibold text-mariner-900 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Biografía Profesional
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Escribe una breve descripción de tu trayectoria y áreas de interés en IA..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500"
            />
          </div>

          {/* Enlaces Sociales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-mariner-900 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Sitio Web Personal / Blog
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://micolegio.edu"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mariner-900 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> Perfil de LinkedIn
              </label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/usuario"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs text-mariner-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-mariner-500"
              />
            </div>
          </div>

          {/* Guardar */}
          <div className="pt-4 border-t border-mariner-100 dark:border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar Perfil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
