// src/requests/authAPI.ts
import { createEndpoint } from "./core/endpoint";
import Cookies from "js-cookie";
import {
  setAccessToken,
  clearAccessToken,
} from "./core/tokenStore";

// ==========================
// 型定義
// ==========================

/**
 * ログインリクエスト
 * バックエンドの OpenAPI に合わせて mailAddress を使う
 */
export interface LoginRequest {
  mailAddress: string;
  password: string;
}

/**
 * バックエンドからの生レスポンス（OpenAPI の TokenResponse）
 * {
 *   "access_token": "...",
 *   "access_expires_at": "2025-11-28T12:34:56Z"
 * }
 */
export interface TokenResponse {
  access_token: string;
  access_expires_at: string;
}

/**
 * フロントで使う整形済みの型（キャメルケース）
 */
export interface LoginResult {
  accessToken: string;
  accessExpiresAt: string;
}

// ==========================
// Endpoints（生のエンドポイント）
// ==========================

/**
 * ログイン
 * - 認証不要（auth: false）
 * - POST なので CSRF は Axios の interceptor に任せる
 */
export const postLoginRaw = createEndpoint<LoginRequest, TokenResponse>(
  "POST",
  "/auth/login",
  {
    auth: false,
  },
);

/**
 * リフレッシュ
 * - 認証不要（refreshToken は HttpOnly Cookie）
 * - withCredentials: true なので自動で Cookie が付く
 */
export const postRefreshRaw = createEndpoint<void, TokenResponse>(
  "POST",
  "/auth/refresh",
  {
    auth: false,
  },
);

/**
 * ログアウト
 * - 認証必要（auth: true → AccessToken を付与）
 * - refreshToken は Cookie からサーバ側が消す想定
 */
export const postLogoutRaw = createEndpoint<void, void>(
  "POST",
  "/auth/logout",
  {
    auth: true,
  },
);

/**
 *　CSRFトークン取得 (GET /auth/csrf)
 * - 認証不要
 * - サーバーが Set-Cookie で XSRF-TOKEN をセットすることを期待
 */
export const getCsrfTokenRaw = createEndpoint<void, void>(
  "GET",
  "/auth/csrf",
  {
    auth: false,
  },
);

// ==========================
// フロントで使いやすいラッパー関数
// ==========================

export async function login(input: LoginRequest): Promise<LoginResult> {
  const res = await postLoginRaw(input);

  const result: LoginResult = {
    accessToken: res.access_token,
    accessExpiresAt: res.access_expires_at,
  };

  // ★ メモリ上のトークンを更新
  setAccessToken(result.accessToken, result.accessExpiresAt);

  return result;
}

export async function refreshAccessToken(): Promise<LoginResult> {
  const res = await postRefreshRaw(undefined as void);

  const result: LoginResult = {
    accessToken: res.access_token,
    accessExpiresAt: res.access_expires_at,
  };

  // ★ リフレッシュ成功時もメモリ上のトークンを更新
  setAccessToken(result.accessToken, result.accessExpiresAt);

  return result;
}

/**
 * ログアウト用の薄いラッパー
 * - サーバ側のセッション / RT Cookie を無効化
 * - フロント側のメモリ上の AT もクリア
 */
export async function logout(): Promise<void> {
  try {
    await postLogoutRaw(undefined as void);
  } finally {
    clearAccessToken();
  }
}

/**
 * ★CSRFトークンを取得して返す関数
 * lib/api.ts の fetchCsrfToken をここに移植
 */
export async function fetchCsrfToken(): Promise<string> {
  await getCsrfTokenRaw(undefined as void);

  const csrfToken = Cookies.get("XSRF-TOKEN")?.toString() ?? "";
  
  return csrfToken;
}
