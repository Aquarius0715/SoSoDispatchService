"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import type { User } from "@/types/interfaces";
import { getMe } from "@/requests/userAPI";
import {
  logout as apiLogout,
  refreshAccessToken,
} from "@/requests/authAPI";
import { getAccessToken } from "@/requests/core/tokenStore";

// --------------------
// State Context
// --------------------
type AuthState = {
  user: User | null;
  isLoading: boolean;
};

const AuthStateContext = createContext<AuthState | null>(null);

// --------------------
// Actions Context
// --------------------
type AuthActions = {
  /**
   * access token が有効（または interceptor により refresh 済み）な前提で /users/me を叩く
   */
  fetchMe: () => Promise<User>;

  /**
   * 明示的に「復元」を行う：tokenが無ければ refresh → /users/me
   */
  reloadMe: () => Promise<User>;

  /**
   * /auth/logout + ローカル削除
   */
  logout: () => Promise<void>;
};

const AuthActionsContext = createContext<AuthActions | null>(null);

// --------------------
// Provider
// --------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // access token が有効（または interceptor により refresh 済み）な前提で me を取得
  const fetchMe = useCallback(async (): Promise<User> => {
    const me = await getMe(); // 401なら client.ts interceptor が refresh→retry する想定
    setUser(me);
    return me;
  }, []);

  // 明示的に「復元」：token が無ければ refresh を試してから me
  const reloadMe = useCallback(async (): Promise<User> => {
    // token が無いときだけ refresh（無駄打ち防止）
    if (!getAccessToken()) {
      await refreshAccessToken(); // 未ログインなら 401 で落ちる（正常）
    }
    return await fetchMe();
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  // 初回マウント時：authページでは復元しない（tokenexpired で無限に叩くのを防ぐ）
  useEffect(() => {
    if (pathname.startsWith("/auth")) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        await reloadMe();
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [pathname, reloadMe]);

  const stateValue = useMemo<AuthState>(
    () => ({ user, isLoading }),
    [user, isLoading]
  );

  const actionsValue = useMemo<AuthActions>(
    () => ({ fetchMe, reloadMe, logout }),
    [fetchMe, reloadMe, logout]
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

// --------------------
// Hooks
// --------------------
export function useAuthState() {
  const ctx = useContext(AuthStateContext);
  if (!ctx) throw new Error("useAuthState must be used within AuthProvider");
  return ctx;
}

export function useAuthActions() {
  const ctx = useContext(AuthActionsContext);
  if (!ctx) throw new Error("useAuthActions must be used within AuthProvider");
  return ctx;
}
