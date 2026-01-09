// src/requests/core/tokenStore.ts

// サーバーサイドかどうかを判定
const isServer = typeof window === "undefined";

// メモリ上だけに持つアクセストークンと有効期限
let accessToken: string | null = null;
let accessTokenExpiresAt: string | null = null;

/**
 * アクセストークンのセット / 更新
 */
export function setAccessToken(token: string | null, expiresAt?: string | null) {
  // サーバーサイドでは何もしない（メモリリーク・情報漏洩防止）
  if (isServer) return;
  
  accessToken = token;
  accessTokenExpiresAt = expiresAt ?? null;
}

/**
 * 現在のアクセストークンを取得
 */
export function getAccessToken(): string | null {
  if (isServer) return null;
  return accessToken;
}

/**
 * アクセストークンの有効期限を取得
 */
export function getAccessTokenExpiresAt(): string | null {
  if (isServer) return null;
  return accessTokenExpiresAt;
}

/**
 * アクセストークンをクリア
 */
export function clearAccessToken() {
  if (isServer) return;
  
  accessToken = null;
  accessTokenExpiresAt = null;
}

/**
 * アクセストークンが有効か判定
 */
export function isAccessTokenValid(leewayMs = 60_000): boolean {
  if (isServer) return false;
  
  const token = getAccessToken();
  const expiresAt = getAccessTokenExpiresAt();

  if (!token || !expiresAt) return false;

  const expires = Date.parse(expiresAt);
  if (Number.isNaN(expires)) return false;

  return expires - leewayMs > Date.now();
}