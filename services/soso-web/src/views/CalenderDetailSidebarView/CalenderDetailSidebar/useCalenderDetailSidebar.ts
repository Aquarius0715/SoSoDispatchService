// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/useCalenderDetailSidebar.ts
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { type SidebarTab, parseSidebarTab } from "./schema";

export type UseCalenderDetailSidebarResult = {
  tab: SidebarTab;
  title: string;
  description: string;
  makeHref: (next: SidebarTab) => string;
};

/**
 * /calenders/[id] のサイドバー表示ロジック。
 * - URLSearchParams の sidebar からタブを決める
 * - タブ切り替え用 href を生成する
 */
export function useCalenderDetailSidebar(): UseCalenderDetailSidebarResult {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = parseSidebarTab(searchParams.get("sidebar"));

  const title =
    tab === "members" ? "メンバー一覧" : "SOSoポイントタイムライン";

  const description =
    tab === "members"
      ? "参加メンバーの車情報とSOSoポイント"
      : "SOSoポイントの変更履歴";

  const makeHref = (next: SidebarTab) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("sidebar", next);
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return { tab, title, description, makeHref };
}
