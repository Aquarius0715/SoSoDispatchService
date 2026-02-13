import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  AxiosHeaders,
} from "axios";
import Cookies from "js-cookie";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

// _auth/_csrf を AxiosRequestConfig に追加
export type ApiRequestConfig<D = any> = AxiosRequestConfig<D> & {
  _auth?: boolean;
  _csrf?: boolean;
};

type InternalApiConfig = InternalAxiosRequestConfig & {
  _auth?: boolean;
  _csrf?: boolean;
  _retry?: boolean; // retry 制御（内部用）
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

// ==============================
// CSRF token
// ==============================
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

// ==============================
// redirects (tokenexpired / not-found)
// ==============================
let redirectedToTokenExpired = false;
let redirectedToNotFound = false;

function shouldSkipRedirectToTokenExpired() {
  if (typeof window === "undefined") return true;
  return window.location.pathname.startsWith("/auth");
}

function redirectToTokenExpiredOnce() {
  if (typeof window === "undefined") return;
  if (redirectedToTokenExpired) return;
  if (shouldSkipRedirectToTokenExpired()) return;

  redirectedToTokenExpired = true;
  clearAccessToken();

  const next = window.location.pathname + window.location.search;
  window.location.assign(
    `/auth/tokenexpired?next=${encodeURIComponent(next)}`
  );
}

function shouldSkipRedirectToNotFound() {
  if (typeof window === "undefined") return true;
  const p = window.location.pathname;
  // auth 系は 403 でもこの画面に飛ばさない
  if (p.startsWith("/auth")) return true;
  if (p.startsWith("/not-found")) return true;
  return false;
}

function redirectToNotFoundOnce() {
  if (typeof window === "undefined") return;
  if (redirectedToNotFound) return;
  if (shouldSkipRedirectToNotFound()) return;

  redirectedToNotFound = true;

  window.location.assign("/not-found");
}

// auth系 endpoint は refresh で救わない（ループ源になりやすい）（ループ源になりやすい）
function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/csrf") ||
    url.includes("/auth/refresh")
  );
}

// Authorization を付けるべきか（デフォルトON。auth系は除外）
function shouldAttachAuth(cfg: InternalApiConfig): boolean {
  if (cfg._auth === false) return false; // 明示的に外したい時
  if (isAuthEndpoint(cfg.url)) return false;
  return true;
}

// ==============================
// refresh (bypass apiClient interceptors)
// ==============================
type TokenResponse = {
  access_token: string;
  access_expires_at: string;
};

const refreshClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

async function refreshOnce(): Promise<void> {
  const res = await refreshClient.post<TokenResponse>("/auth/refresh");
  setAccessToken(res.data.access_token, res.data.access_expires_at);
}

let refreshPromise: Promise<void> | null = null;

// ==============================
// Interceptors: request
// ==============================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const cfg = config as InternalApiConfig;
    if (!cfg.headers) cfg.headers = new AxiosHeaders();

    const method = (cfg.method ?? "get").toUpperCase();
    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    // CSRF
    if (isMutating || cfg._csrf) {
      const token = await ensureCsrfToken();
      if (token) cfg.headers.set("X-CSRF-Token", token);
    }

    // Authorization（デフォルトON）
    if (shouldAttachAuth(cfg)) {
      const token = getAccessToken();
      if (token) cfg.headers.set("Authorization", `Bearer ${token}`);
    }

    delete cfg._auth;
    delete cfg._csrf;
    return cfg;
  },
  (error) => Promise.reject(error)
);

// ==============================
// Interceptors: response
// 401 -> refresh(1回) -> retry(1回)
// refresh 失敗 -> tokenexpired
// ==============================
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const status = error.response?.status;
    const cfg = error.config as InternalApiConfig | undefined;
    if (!cfg) return Promise.reject(error);

    // 403 -> Not Found ページへ
    if (status === 403) {
      redirectToNotFoundOnce();
      return Promise.reject(error);
    }

    // ★ 401 のみ refresh 対象
    if (status !== 401) {
      return Promise.reject(error);
    }

    // auth系は refresh 対象外（ここで tokenexpired に寄せる）
    if (isAuthEndpoint(cfg.url)) {
      redirectToTokenExpiredOnce();
      return Promise.reject(error);
    }

    // 既にリトライ済み
    if (cfg._retry) {
      redirectToTokenExpiredOnce();
      return Promise.reject(error);
    }

    cfg._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshOnce().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;

      const token = getAccessToken();
      if (!token) {
        redirectToTokenExpiredOnce();
        return Promise.reject(error);
      }

      return apiClient.request(cfg);
    } catch (e) {
      redirectToTokenExpiredOnce();
      return Promise.reject(e);
    }
  }
);

// ==============================
// Typed API helpers (return data)
// ==============================
export async function apiGet<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: ApiRequestConfig<D>
): Promise<T> {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

export async function apiPut<T, D = unknown>(
  url: string,
  data?: D,
  config?: ApiRequestConfig<D>
): Promise<T> {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
}

export async function apiPatch<T, D = unknown>(
  url: string,
  data?: D,
  config?: ApiRequestConfig<D>
): Promise<T> {
  const res = await apiClient.patch<T>(url, data, config);
  return res.data;
}

export async function apiDelete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}
