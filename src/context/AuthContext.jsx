import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken, clearAccessToken, refreshAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        await refreshAccessToken();
        const res = await api.get("/api/educator/me");
        setUser({
          id: res.data.id,
          nick_name: res.data.nick_name,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
        });
      } catch (err) {
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  async function login(email, password) {
    const res = await api.post("/api/auth/login", { email, password });
    const { access_token } = res.data;
    setAccessToken(access_token);

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
    const res = await api.post("/api/auth/verify-email", { email, code, token });
    if (res.data.access_token) setAccessToken(res.data.access_token);
    return res;
  }

  async function forgotPassword(email) {
    return await api.post("/api/auth/forgot-password", { email });
  }

  async function resetPassword({ token, new_password }) {
    return await api.post("/api/auth/reset-password", { token, new_password });
  }

  async function logout() {
    try {
      await api.post("/api/auth/logout", {});
    } catch {
      // Ignorar errores durante el logout
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
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
