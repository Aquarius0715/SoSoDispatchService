// src/requests/authAPI.ts
import { apiPost } from "./core/client";
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
  const data = await apiPost<TokenResponse, LoginRequest>(
    "/auth/login",
    input
  );

  const result: LoginResult = {
    accessToken: data.access_token,
    accessExpiresAt: data.access_expires_at,
  };

  setAccessToken(result.accessToken, result.accessExpiresAt);
  return result;
}

export async function refreshAccessToken(): Promise<LoginResult> {
  const data = await apiPost<TokenResponse>(
    "/auth/refresh"
  );

  const result: LoginResult = {
    accessToken: data.access_token,
    accessExpiresAt: data.access_expires_at,
  };

  setAccessToken(result.accessToken, result.accessExpiresAt);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await apiPost<void>("/auth/logout");
  } finally {
    clearAccessToken();
  }
}
