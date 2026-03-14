// src/app/page.tsx
import { handleRootRedirect } from "@/lib/server/rootRedirect";

export const dynamic = "force-dynamic"; // 毎回評価させる

export default async function RootPage() {
  // 認証状態に応じて /login または /calendarList に飛ばす
  await handleRootRedirect();

  // redirect() は例外として投げられるので、ここには基本到達しない
  return null;
}
