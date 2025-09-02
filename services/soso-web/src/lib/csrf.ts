// lib/api.ts
import Cookies from "js-cookie";

export const fetchCsrfToken = async (): Promise<string> => {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  const response = await fetch(`${API_BASE}/auth/csrf`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch CSRF token`);
  }

  const csrfToken = Cookies.get("XSRF-TOKEN")?.toString() ?? "";
  return csrfToken;
};
