// src/requests/core/tokenStore.ts

// メモリ上だけに持つアクセストークンと有効期限
let accessToken: string | null = null;
let accessTokenExpiresAt: string | null = null;

/**
 * アクセストークンのセット / 更新
 */
export function setAccessToken(token: string | null, expiresAt?: string | null) {
  accessToken = token;
  accessTokenExpiresAt = expiresAt ?? null;
}

/**
 * 現在のアクセストークンを取得
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * アクセストークンの有効期限を取得（文字列のまま）
 */
export function getAccessTokenExpiresAt(): string | null {
  return accessTokenExpiresAt;
}

/**
 * アクセストークンをクリア（ログアウト等）
 */
export function clearAccessToken() {
  accessToken = null;
  accessTokenExpiresAt = null;
}

/**
 * アクセストークンが「今時点で」有効そうかざっくり判定
 * - トークンと expiresAt が両方あり
 * - 現在時刻 + leewayMs < expiresAt
 */
export function isAccessTokenValid(leewayMs = 60_000): boolean {
  if (!accessToken || !accessTokenExpiresAt) return false;

  const expires = Date.parse(accessTokenExpiresAt);
  if (Number.isNaN(expires)) return false;

  return expires - leewayMs > Date.now();
}
