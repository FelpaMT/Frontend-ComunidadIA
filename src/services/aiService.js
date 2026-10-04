import api from "../api/client";

/**
 * Servicio para interactuar con el Asistente Virtual Google Gemini.
 *
 * @param {Object} params
 * @param {string} params.message - Consulta o mensaje del usuario.
 * @param {number|string|null} [params.publicationId=null] - ID opcional de la publicación actual.
 * @param {Array} [params.history=[]] - Historial conversacional previo.
 * @returns {Promise<{response: string, context_used: boolean}>}
 */
export async function sendChatMessage({ message, publicationId = null, history = [] }) {
  try {
    const payload = {
      message,
      publication_id: publicationId ? Number(publicationId) : null,
      history: Array.isArray(history) ? history : [],
    };

    const response = await api.post("/api/ai/chat/", payload);
    return response.data;
  } catch (error) {
    console.error("[aiService] Error en petición a chatbot IA:", error);
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      (typeof error.response?.data === "string" ? error.response.data : null) ||
      error.message ||
      "No se pudo conectar con el Asistente IA. Inténtalo más tarde.";
    throw new Error(errorMessage);
  }
}
