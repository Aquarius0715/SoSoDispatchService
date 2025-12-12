// src/requests/core/client.ts
import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import Cookies from "js-cookie"; // ここでCookiesを使う
import { getAccessToken, clearAccessToken } from "./tokenStore";

// 拡張設定の型定義
export type ApiRequestConfig = AxiosRequestConfig & {
  _auth?: boolean; // Authorizationヘッダーを付けるか
  _csrf?: boolean; // CSRFトークンチェックを行うか
};

// 内部用設定型
type InternalApiConfig = InternalAxiosRequestConfig & {
  _auth?: boolean;
  _csrf?: boolean;
};

// ベースURLの設定
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

// ==== CSRFトークン管理 ====
let csrfTokenPromise: Promise<string> | null = null;

/**
 * CSRFトークンを確実に取得・保証する
 * - Cookieに XSRF-TOKEN がない場合、サーバーの /auth/csrf を叩いてセットさせる
 */
async function ensureCsrfToken(): Promise<string> {
  // 1. まずCookieを確認
  let token = Cookies.get("XSRF-TOKEN");
  if (token) return token;

  // 2. 進行中の取得リクエストがあればそれを待つ（重複リクエスト防止）
  if (csrfTokenPromise) return csrfTokenPromise;

  // 3. なければ取得リクエスト開始
  // 循環参照を防ぐため、ここで直接 axios.get する（clientインスタンスを使うと無限ループの危険があるため素のaxiosか、設定で回避）
  csrfTokenPromise = (async () => {
    try {
      // 認証不要のエンドポイントとして叩く
      await axios.get(`${BASE_URL}/auth/csrf`, {
        withCredentials: true,
      });
      // レスポンス取得後、ブラウザがSet-Cookieを処理しているので、Cookieから読めるはず
      const newToken = Cookies.get("XSRF-TOKEN") || "";
      return newToken;
    } catch (e) {
      console.error("CSRF Token fetch failed", e);
      return "";
    } finally {
      csrfTokenPromise = null;
    }
  })();

  return csrfTokenPromise;
}

// ==== Request Interceptor ====
client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const cfg = config as InternalApiConfig;
    
    // ヘッダーオブジェクトの初期化
    if (!cfg.headers) {
      cfg.headers = new AxiosHeaders();
    }

    const method = (cfg.method ?? "get").toUpperCase();
    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    // --- 1. CSRF Token Injection ---
    // 書き込み系メソッド、または明示的に _csrf: true が指定された場合
    if (isMutating || cfg._csrf) {
      const token = await ensureCsrfToken();
      if (token) {
        cfg.headers.set("X-CSRF-Token", token);
      }
    }

    // --- 2. Access Token Injection ---
    // 明示的に _auth: true が指定された場合
    if (cfg._auth) {
      const token = getAccessToken();
      if (token) {
        cfg.headers.set("Authorization", `Bearer ${token}`);
      }
    }

    // カスタムプロパティの削除（Axiosに怒られないように）
    delete cfg._auth;
    delete cfg._csrf;

    return cfg;
  },
  (error) => Promise.reject(error)
);

// ==== Response Interceptor (Optional) ====
// 401エラー時にトークンをクリアするなどの処理を入れると親切です
client.interceptors.response.use(
  (response) => response.data, // 常に data を返す設定（お好みで）
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // 認証エラー時はストアをクリア
      clearAccessToken();
    }
    return Promise.reject(error);
  }
);