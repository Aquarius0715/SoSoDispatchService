// src/requests/core/client.ts
import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { fetchCsrfToken } from "@/lib/csrf";
import { getAccessToken } from "./tokenStore";

export type ApiRequestConfig = AxiosRequestConfig & {
  _auth?: boolean;
  _csrf?: boolean;
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  timeout: 10_000,
  withCredentials: true,

  // ★ バックエンドの env に合わせる
  xsrfCookieName: "XSRF-TOKEN", // CSRF_COOKIE_NAME と一致
  xsrfHeaderName: "X-CSRF-Token", // CSRF_HEADER_NAME と一致
});

// ==== CSRFトークンをちょっとだけキャッシュする ====
let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

async function ensureCsrfToken(): Promise<string> {
  if (csrfTokenCache) return csrfTokenCache;

  if (!csrfTokenPromise) {
    csrfTokenPromise = fetchCsrfToken().then((token) => {
      csrfTokenCache = token;
      csrfTokenPromise = null;
      return token;
    });
  }

  return csrfTokenPromise;
}

type InternalApiConfig = InternalAxiosRequestConfig & {
  _auth?: boolean;
  _csrf?: boolean;
};

// ==== リクエストインターセプタ ====
apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const cfg = config as InternalApiConfig;

    const method = (cfg.method ?? "get").toUpperCase();
    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    // CSRF: 書き込み系のときは Cookie を確実にセットしておく
    const needCsrf = cfg._csrf ?? isMutating;
    if (needCsrf) {
      await ensureCsrfToken();
      // axios が xsrfCookieName/xsrfHeaderName を見て自動でヘッダを付与する
    }

    // AccessToken: _auth=true のときだけ Authorization を付与
    if (cfg._auth) {
      // SSR 中でも落ちないように window チェック
      const accessToken =
        typeof window === "undefined" ? null : getAccessToken();

      if (accessToken) {
        cfg.headers = {
          ...(cfg.headers ?? {}),
          Authorization: `Bearer ${accessToken}`,
        } as any;
      }
    }

    delete cfg._auth;
    delete cfg._csrf;

    return cfg;
  },
  (error) => Promise.reject(error),
);
