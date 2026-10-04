import React, { createContext, useContext, useEffect, useState } from "react";
import api, {
  setTokenCookies,
  clearTokenCookies,
  getAccessToken,
  getRefreshToken,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!getRefreshToken() || !!getAccessToken();

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
      } catch (err) {
        clearTokenCookies();
        setUser(null);
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
    return me.data;
  }

  async function register({ name, email, password, nick_name, role = "EDUCATOR" }) {
    const body = {
      name,
      email,
      password,
      role,
      nick_name,
    };
    return await api.post("/api/auth/signup", body);
  }

  async function verifyEmail({ email, code, token }) {
    return await api.post("/api/auth/verify-email", { email, code, token });
  }

  async function forgotPassword(email) {
    return await api.post("/api/auth/forgot-password", { email });
  }

  async function resetPassword({ token, new_password }) {
    return await api.post("/api/auth/reset-password", { token, new_password });
  }

  async function logout() {
    try {
      const refresh = getRefreshToken();
      if (refresh) {
        await api.post("/api/auth/logout", { refresh_token: refresh });
      }
    } catch {
      // Ignorar errores durante el logout
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
    register,
    signup: register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
