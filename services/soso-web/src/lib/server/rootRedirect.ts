// src/lib/server/rootRedirect.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const RT_COOKIE_NAME = process.env.NEXT_PUBLIC_RT_COOKIE_NAME || "rt";

export async function handleRootRedirect(): Promise<never> {
  // ★ cookies() は Promise なので await が必要
  const cookieStore = await cookies();
  const rt = cookieStore.get(RT_COOKIE_NAME);

  // 1. RT Cookie が存在しない → ログイン画面へ
  if (!rt) {
    redirect("/login");
  }

  try {
    // 2. RT があれば /auth/refresh で有効性チェック
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: `${RT_COOKIE_NAME}=${rt.value}`,
      },
      cache: "no-store",
    });

    // 3. 401/403 など → RT 無効 → /login
    if (!res.ok) {
      redirect("/login");
    }

    // 4. 有効なら /calenderList へ
    redirect("/calenderList");
  } catch {
    redirect("/login");
  }
}
