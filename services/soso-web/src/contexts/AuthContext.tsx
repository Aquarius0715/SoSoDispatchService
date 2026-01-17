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
import { logout as apiLogout } from "@/requests/authAPI";

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
  fetchMe: () => Promise<User>;
  reloadMe: () => Promise<User>;
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
    const me = await getMe(); // 401/403なら client.ts interceptor が refresh→retry する
    setUser(me);
    return me;
  }, []);

  // 「明示的に再取得したい」用途に残す（中身は fetchMe で十分）
  const reloadMe = useCallback(async (): Promise<User> => {
    return await fetchMe();
  }, [fetchMe]);

  // logout（API + tokenStoreクリア）-> userクリア
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  // 初回マウント時：authページでは復元しない（tokenexpired で無限に叩くのを防ぐ）
  useEffect(() => {
    // /auth 配下（login/register/tokenexpired 等）は何もしない
    if (pathname.startsWith("/auth")) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        await fetchMe();
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [pathname, fetchMe]);

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
