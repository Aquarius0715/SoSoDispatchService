"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@/types/interfaces";
import { getMe } from "@/requests/userAPI";
import { refreshAccessToken, logout as apiLogout } from "@/requests/authAPI";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  setUser: (u: User | null) => void;
  fetchMe: () => Promise<User>;
  reloadMe: () => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async (): Promise<User> => {
    const me = await getMe();
    setUser(me);
    return me;
  };

  const reloadMe = async (): Promise<User> => {
    await refreshAccessToken(); // rt cookie -> access token 復元（あなたのauthAPIがsetAccessTokenまでやる）
    return await fetchMe();
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  };

  // リロード時に復元
  useEffect(() => {
    (async () => {
      try {
        await reloadMe();
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, setUser, fetchMe, reloadMe, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
