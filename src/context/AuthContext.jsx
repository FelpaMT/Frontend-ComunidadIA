import React, { createContext, useContext, useEffect, useState } from "react";
import api, {
  setTokenCookies,
  clearTokenCookies,
  getAccessToken,
  getRefreshToken,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {id, name, email, role, nick_name}
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!getRefreshToken(); // usamos refresh como indicador simple

  // Intento opcional de obtener perfil si ya hay token
  useEffect(() => {
    async function fetchMe() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/api/educator/me");
        setUser({
          id: res.data.id,
          nick_name: res.data.nick_name,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
        });
      } catch {
        // Si falla, consideramos no autenticado
        clearTokenCookies();
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [isAuthenticated]);

  async function login(email, password) {
    const res = await api.post("/api/auth/login", { email, password });
    const { access_token, refresh_token } = res.data;
    setTokenCookies(access_token, refresh_token);

    // Traer info de usuario
    const me = await api.get("/api/educator/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    setUser({
      id: me.data.id,
      nick_name: me.data.nick_name,
      name: me.data.user.name,
      email: me.data.user.email,
      role: me.data.user.role,
    });
  }

  async function signup({ name, email, password, nick_name }) {
    const body = {
      name,
      email,
      password,
      role: "EDUCATOR", // SIEMPRE EDUCATOR
      nick_name,
    };
    await api.post("/api/auth/signup", body);
  }

  async function logout() {
    try {
      const refresh = getRefreshToken();
      if (refresh) {
        await api.post("/api/auth/logout", { refresh_token: refresh });
      }
    } catch {
      // ignorar errores de logout
    } finally {
      clearTokenCookies();
      setUser(null);
    }
  }

  const value = {
    user,
    isAuthenticated: !!user || !!getRefreshToken(),
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
