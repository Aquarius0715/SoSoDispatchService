// src/requests/authAPI.ts
import { apiClient } from "./core/client"; // ← ここを修正
import { setAccessToken, clearAccessToken } from "./core/tokenStore";

// --- Types ---
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

// --- API Functions ---
export async function login(input: LoginRequest): Promise<LoginResult> {
  // client -> apiClient に変更
  const res = await apiClient.post<TokenResponse>("/auth/login", input);
  const data = res as unknown as TokenResponse;

  const result: LoginResult = {
    accessToken: data.access_token,
    accessExpiresAt: data.access_expires_at,
  };

  setAccessToken(result.accessToken, result.accessExpiresAt);
  return result;
}

export async function refreshAccessToken(): Promise<LoginResult> {
  const res = await apiClient.post<TokenResponse>("/auth/refresh");
  const data = res as unknown as TokenResponse;

  const result: LoginResult = {
    accessToken: data.access_token,
    accessExpiresAt: data.access_expires_at,
  };

  setAccessToken(result.accessToken, result.accessExpiresAt);
  return result;
}

export async function logout(): Promise<void> {
  try {
    // _auth: true オプションを使用
    await apiClient.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
}