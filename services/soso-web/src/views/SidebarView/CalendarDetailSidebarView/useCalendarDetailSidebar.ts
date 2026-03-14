// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/useCalendarDetailSidebar.ts
"use client";

import { useState } from "react";
import { type SidebarTab } from "./schema";

export type UseCalendarDetailSidebarResult = {
  tab: SidebarTab;
  title: string;
  setTab: (next: SidebarTab) => void;
};

export function useCalendarDetailSidebar(
  initialTab: SidebarTab = "members"
): UseCalendarDetailSidebarResult {
  const [tab, setTab] = useState<SidebarTab>(initialTab);

  const title =
    tab === "members" ? "メンバー一覧" : "SOSoポイントタイムライン";

  return { tab, title, setTab };
}
