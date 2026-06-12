"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AuthUser } from "@/shared/types";

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: { name: string; username: string; email: string; password: string }) => Promise<{ error?: string }>;
  logout: () => void;
  updateUser: (updated: AuthUser) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("medium_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Login failed" };
    setUser(data.user);
    localStorage.setItem("medium_user", JSON.stringify(data.user));
    return {};
  }, []);

  const register = useCallback(async (payload: { name: string; username: string; email: string; password: string }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Register failed" };
    setUser(data.user);
    localStorage.setItem("medium_user", JSON.stringify(data.user));
    return {};
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("medium_user");
  }, []);

  const updateUser = useCallback((updated: AuthUser) => {
    setUser(updated);
    localStorage.setItem("medium_user", JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
