"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, clearToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On first load, if a token exists, try to fetch the current user.
    const token =
      typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getMe()
      .then((data) => setUser(data))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function loginWithToken(tokenResponse) {
    setToken(tokenResponse.access_token);
    setUser(tokenResponse.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
