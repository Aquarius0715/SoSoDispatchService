// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/useCalenderDetailSidebar.ts
"use client";

import { useState } from "react";
import { type SidebarTab } from "./schema";

export type UseCalenderDetailSidebarResult = {
  tab: SidebarTab;
  title: string;
  setTab: (next: SidebarTab) => void;
};

export function useCalenderDetailSidebar(
  initialTab: SidebarTab = "members"
): UseCalenderDetailSidebarResult {
  const [tab, setTab] = useState<SidebarTab>(initialTab);

  const title =
    tab === "members" ? "メンバー一覧" : "SOSoポイントタイムライン";

  return { tab, title, setTab };
}
