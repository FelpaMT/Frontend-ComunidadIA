import api from "../api/client";

/**
 * Servicio centralizado para llamadas de la Red de Educadores y Perfiles (Fase 2)
 */
export const educatorService = {
  /**
   * Obtiene la lista paginada y filtrable de educadores
   */
  async getEducators(params = { offset: 0, limit: 10, q: "" }) {
    if (params.q) {
      const res = await api.get("/api/educator/search", { params });
      return res.data;
    }
    const res = await api.get("/api/educator", { params });
    return res.data;
  },

  /**
   * Obtiene el detalle público de un educador por ID
   */
  async getEducatorById(id) {
    if (id === "me") {
      const res = await api.get("/api/educator/me");
      return res.data;
    }
    const res = await api.get(`/api/educators/${id}`);
    return res.data;
  },

  /**
   * Actualiza el perfil del educador autenticado
   */
  async updateMyProfile(profileData) {
    const res = await api.put("/api/educator/me/update", profileData);
    return res.data;
  },

  /**
   * Alterna la suscripción (follow/unfollow) a un educador de forma atómica
   */
  async toggleSubscription(educatorId, currentlyFollowing) {
    if (currentlyFollowing) {
      const res = await api.post(`/api/subscription/unfollow/${educatorId}`);
      return { ...res.data, is_following: false };
    } else {
      const res = await api.post(`/api/subscription/follow/${educatorId}`);
      return { ...res.data, is_following: true };
    }
  },

  /**
   * Obtiene los seguidores de un educador
   */
  async getFollowers(educatorId, params = { offset: 0, limit: 10 }) {
    if (educatorId === "me") {
      const res = await api.get("/api/subscription/me/followers", { params });
      return res.data;
    }
    const res = await api.get(`/api/subscription/${educatorId}/followers`, { params });
    return res.data;
  },

  /**
   * Obtiene los educadores seguidos por un educador
   */
  async getFollowing(educatorId, params = { offset: 0, limit: 10 }) {
    if (educatorId === "me") {
      const res = await api.get("/api/subscription/me/following", { params });
      return res.data;
    }
    const res = await api.get(`/api/subscription/${educatorId}/following`, { params });
    return res.data;
  }
};

export default educatorService;
