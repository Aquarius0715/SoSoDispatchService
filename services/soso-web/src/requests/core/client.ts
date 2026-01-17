// src/requests/core/client.ts
import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import Cookies from "js-cookie";
import { getAccessToken, clearAccessToken } from "./tokenStore";

// 型定義
export type ApiRequestConfig<D = any> = AxiosRequestConfig<D> & {
  _auth?: boolean;
  _csrf?: boolean;
};

type InternalApiConfig = InternalAxiosRequestConfig & {
  _auth?: boolean;
  _csrf?: boolean;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

// ==== CSRFトークン管理 ====
let csrfTokenPromise: Promise<string> | null = null;

async function ensureCsrfToken(): Promise<string> {
  const token = Cookies.get("XSRF-TOKEN");
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

// ✅ ここから追加：typed wrapper
export async function apiGet<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  return apiClient.get(url, config) as unknown as T;
}

export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: ApiRequestConfig<D>
): Promise<T> {
  return apiClient.post(url, data, config) as unknown as T;
}

export async function apiPut<T, D = unknown>(
  url: string,
  data?: D,
  config?: ApiRequestConfig<D>
): Promise<T> {
  return apiClient.put(url, data, config) as unknown as T;
}

export async function apiPatch<T, D = unknown>(
  url: string,
  data?: D,
  config?: ApiRequestConfig<D>
): Promise<T> {
  return apiClient.patch(url, data, config) as unknown as T;
}

export async function apiDelete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  return apiClient.delete(url, config) as unknown as T;
}
