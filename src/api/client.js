import axios from "axios";

// Base URL del backend
const BASE_URL = import.meta.env.VITE_API_URL || "https://comunidadia-backend.pedagogiavirtual.com";

// Helpers de cookies simples (no HttpOnly, porque estamos en frontend puro)
const COOKIE_ACCESS = "comunidadia_access";
const COOKIE_REFRESH = "comunidadia_refresh";

export function setTokenCookies(accessToken, refreshToken) {
  // Expiración genérica de 7 días; el backend también controla expiración real.
  const days = 7;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  if (accessToken) {
    document.cookie = `${COOKIE_ACCESS}=${accessToken}; expires=${expires}; path=/;`;
  }
  if (refreshToken) {
    document.cookie = `${COOKIE_REFRESH}=${refreshToken}; expires=${expires}; path=/;`;
  }
}

export function clearTokenCookies() {
  document.cookie = `${COOKIE_ACCESS}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${COOKIE_REFRESH}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return match[2];
  return null;
}

export function getAccessToken() {
  return getCookie(COOKIE_ACCESS);
}

export function getRefreshToken() {
  return getCookie(COOKIE_REFRESH);
}

const api = axios.create({
  baseURL: BASE_URL,
});

// Flag para evitar loops infinitos de refresh
let isRefreshing = false;
let pendingRequests = [];

function processQueue(error, token = null) {
  pendingRequests.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  pendingRequests = [];
}

// Interceptor para añadir Authorization
api.interceptors.request.use((config) => {
  if (!config.url.startsWith("/api/auth")) {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para manejar 401 y refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si no es 401 o ya intentamos refresh, rechazar
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url.startsWith("/api/auth")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Guardar la petición y reintentar cuando termine el refresh
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = "Bearer " + token;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const newAccess = res.data.new_access_token;
      setTokenCookies(newAccess, refreshToken);

      processQueue(null, newAccess);
      isRefreshing = false;

      originalRequest.headers.Authorization = "Bearer " + newAccess;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      isRefreshing = false;
      clearTokenCookies();
      return Promise.reject(err);
    }
  }
);

export default api;
