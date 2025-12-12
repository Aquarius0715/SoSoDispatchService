// src/requests/authAPI.ts
import { client } from "./core/client";
import { setAccessToken, clearAccessToken } from "./core/tokenStore";

// --- Types ---

export interface LoginRequest {
  mailAddress: string;
  password: string;
}

// バックエンドのレスポンス型 (Snake Case)
export interface TokenResponse {
  access_token: string;
  access_expires_at: string;
}

// フロントエンドの利用型 (Camel Case)
export interface LoginResult {
  accessToken: string;
  accessExpiresAt: string;
}

// --- API Functions ---

/**
 * ログイン実行
 */
export async function login(input: LoginRequest): Promise<LoginResult> {
  // _auth: false (デフォルト), POSTなので自動で CSRF トークンが付与される
  const res = await client.post<TokenResponse>("/auth/login", input);
  
  // client.interceptors.response で data を返しているので、res は TokenResponse そのもの
  // ※ TypeScript上は AxiosResponse と推論される場合があるため、キャストが必要な場合あり
  const data = res as unknown as TokenResponse;

  const result: LoginResult = {
    accessToken: data.access_token,
    accessExpiresAt: data.access_expires_at,
  };

  // メモリに保存
  setAccessToken(result.accessToken, result.accessExpiresAt);

  return result;
}

/**
 * トークンリフレッシュ
 */
export async function refreshAccessToken(): Promise<LoginResult> {
  // Cookie (RefreshToken) は自動送信される
  const res = await client.post<TokenResponse>("/auth/refresh");
  const data = res as unknown as TokenResponse;

  const result: LoginResult = {
    accessToken: data.access_token,
    accessExpiresAt: data.access_expires_at,
  };

  setAccessToken(result.accessToken, result.accessExpiresAt);

  return result;
}

/**
 * ログアウト
 */
export async function logout(): Promise<void> {
  try {
    // _auth: true でアクセストークンを付けてリクエスト
    await client.post("/auth/logout", {}, { _auth: true } as any);
  } finally {
    clearAccessToken();
  }
}