// src/requests/core/client.ts
import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import Cookies from "js-cookie";
import { getAccessToken, clearAccessToken } from "./tokenStore";

// 型定義
export type ApiRequestConfig = AxiosRequestConfig & {
  _auth?: boolean;
  _csrf?: boolean;
};

type InternalApiConfig = InternalAxiosRequestConfig & {
  _auth?: boolean;
  _csrf?: boolean;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// ★ ここを client ではなく apiClient に戻します
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

// ==== CSRFトークン管理 ====
let csrfTokenPromise: Promise<string> | null = null;

async function ensureCsrfToken(): Promise<string> {
  let token = Cookies.get("XSRF-TOKEN");
  if (token) return token;
  if (csrfTokenPromise) return csrfTokenPromise;

  csrfTokenPromise = (async () => {
    try {
      await axios.get(`${BASE_URL}/auth/csrf`, { withCredentials: true });
      return Cookies.get("XSRF-TOKEN") || "";
    } catch (e) {
      console.error("CSRF Token fetch failed", e);
      return "";
    } finally {
      csrfTokenPromise = null;
    }
  })();

  return csrfTokenPromise;
}

// ==== Interceptors ====
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const cfg = config as InternalApiConfig;
    if (!cfg.headers) cfg.headers = new AxiosHeaders();

    const method = (cfg.method ?? "get").toUpperCase();
    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    if (isMutating || cfg._csrf) {
      const token = await ensureCsrfToken();
      if (token) cfg.headers.set("X-CSRF-Token", token);
    }

    if (cfg._auth) {
      const token = getAccessToken();
      if (token) cfg.headers.set("Authorization", `Bearer ${token}`);
    }

    delete cfg._auth;
    delete cfg._csrf;
    return cfg;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAccessToken();
    }
    return Promise.reject(error);
  }
);