// src/requests/authAPI.ts
import axios from "axios";
import { apiPost } from "./core/client";
import { setAccessToken, clearAccessToken } from "./core/tokenStore";

// =====================
// Config
// =====================
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// /auth/refresh は apiClient(interceptor) を通すと干渉しやすいのでバイパスする
const refreshClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

// =====================
// Types
// =====================
export interface LoginRequest {
  mailAddress: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  access_expires_at: string;
}

export interface LoginResult {
  accessToken: string;
  accessExpiresAt: string;
}

// =====================
// Helpers
// =====================
function toLoginResult(data: TokenResponse): LoginResult {
  return {
    accessToken: data.access_token,
    accessExpiresAt: data.access_expires_at,
  };
}

function persist(result: LoginResult) {
  setAccessToken(result.accessToken, result.accessExpiresAt);
}

// =====================
// API Functions
// =====================

/**
 * login:
 * - サーバーは RT cookie を Set-Cookie する想定
 * - access token を tokenStore に保存
 */
export async function login(input: LoginRequest): Promise<LoginResult> {
  const data = await apiPost<TokenResponse, LoginRequest>("/auth/login", input);
  const result = toLoginResult(data);
  persist(result);
  return result;
}

/**
 * refreshAccessToken:
 * - RT cookie を使って access token を再発行
 * - interceptor をバイパスして確実に叩く（refreshループ防止）
 */
export async function refreshAccessToken(): Promise<LoginResult> {
  //const res = await refreshClient.post<TokenResponse>("/auth/refresh");
  const res = await apiPost<TokenResponse>("/auth/refresh", { _csrf: true });
  const result = toLoginResult(res);
  persist(result);
  return result;
}

/**
 * logout:
 * - サーバー側 logout を試行
 * - ローカル tokenStore は必ず消す
 */
export async function logout(): Promise<void> {
  try {
    await apiPost<void>("/auth/logout");
  } finally {
    clearAccessToken();
  }
}
