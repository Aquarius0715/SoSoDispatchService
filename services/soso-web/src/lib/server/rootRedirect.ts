// src/lib/server/rootRedirect.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const RT_COOKIE_NAME = process.env.NEXT_PUBLIC_RT_COOKIE_NAME || "rt";

export async function handleRootRedirect(): Promise<never> {
  const cookieStore = await cookies();
  const rt = cookieStore.get(RT_COOKIE_NAME);

  if (!rt) {
    redirect("/auth/login");
  }

  // RT があれば一旦アプリ側へ（詳細ページ側で必要なら検証）
  redirect("/calenders");
}
