"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@/types/interfaces";
import { getMe } from "@/requests/userAPI";
import { refreshAccessToken, logout as apiLogout } from "@/requests/authAPI";

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
   * access token が既に有効な前提で /users/me を叩いて user を更新する
   * (ログイン直後に使う想定)
   */
  fetchMe: () => Promise<User>;

  /**
   * rt cookie -> /auth/refresh で access token 再発行してから /users/me
   * (リロード直後に使う想定)
   */
  reloadMe: () => Promise<User>;

  /**
   * /auth/logout して tokenStore を消し、user も null にする
   */
  logout: () => Promise<void>;
};

const AuthActionsContext = createContext<AuthActions | null>(null);

// --------------------
// Provider
// --------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // access token がある前提で me を取得
  const fetchMe = useCallback(async (): Promise<User> => {
    const me = await getMe();
    setUser(me);
    return me;
  }, []);

  // refresh -> me
  const reloadMe = useCallback(async (): Promise<User> => {
    await refreshAccessToken(); // authAPI側で setAccessToken 済み
    return await fetchMe();
  }, [fetchMe]);

  // logout（API + tokenStoreクリア）-> userクリア
  const logout = useCallback(async () => {
    try {
      await apiLogout(); // authAPI側で clearAccessToken 済み
    } finally {
      setUser(null);
    }
  }, []);

  // 初回マウント時に復元を試みる
  useEffect(() => {
    (async () => {
      try {
        await reloadMe();
      } catch {
        // rt が無い / refresh失敗 / me失敗 → 未ログイン扱い
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [reloadMe]);

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
