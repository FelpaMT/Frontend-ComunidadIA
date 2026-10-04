import api from "../api/client";

/**
 * Servicio centralizado para el Núcleo de Contenido (Fase 3):
 * Artículos, Foros, Categorías, Imágenes y Comentarios.
 */
export const publicationService = {
  /**
   * Obtiene listado filtrado/paginado de publicaciones
   */
  async getPublications(params = { limit: 10, offset: 0, type: "", category_id: "", search: "" }) {
    if (params.search || params.nickname_part) {
      const res = await api.get("/api/publication/search", { params });
      return res.data;
    }
    const res = await api.get("/api/publication", { params });
    return res.data;
  },

  /**
   * Obtiene detalle completo de una publicación por ID (incluye contenido HTML sanitizable e imágenes)
   */
  async getPublicationById(id) {
    const res = await api.get(`/api/publications/${id}`);
    return res.data;
  },

  /**
   * Crea una nueva publicación (ARTÍCULO o FORO)
   */
  async createPublication(data) {
    const res = await api.post("/api/publication/me/create", data);
    return res.data;
  },

  /**
   * Actualiza una publicación propia existente
   */
  async updatePublication(id, data) {
    const res = await api.put(`/api/publication/me/update/${id}`, data);
    return res.data;
  },

  /**
   * Elimina una publicación por ID
   */
  async deletePublication(id) {
    const res = await api.delete(`/api/publication/me/${id}`);
    return res.data;
  },

  /**
   * Sube una imagen adjunta a una publicación
   */
  async uploadImage(publicationId, file, caption = "") {
    const formData = new FormData();
    formData.append("publication_id", publicationId);
    formData.append("file", file);
    if (caption) formData.append("caption", caption);

    const res = await api.post("/api/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  /**
   * Obtiene la lista de categorías temáticas disponibles
   */
  async getCategories() {
    const res = await api.get("/api/publication/categories");
    return res.data;
  },

  /**
   * Publica un nuevo comentario en una publicación
   */
  async addComment(publicationId, content) {
    const res = await api.post(`/api/commentary/me/${publicationId}`, { content });
    return res.data;
  },

  /**
   * Elimina un comentario propio por ID
   */
  async deleteComment(commentId) {
    const res = await api.delete(`/api/commentary/me/delete/${commentId}`);
    return res.data;
  }
};

export default publicationService;
