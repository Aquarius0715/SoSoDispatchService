// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/schema.ts

import { z } from "zod";

export const sidebarTabSchema = z.enum(["members", "timeline"]);

export type SidebarTab = z.infer<typeof sidebarTabSchema>;

/**
 * 検索パラメータからタブを取り出す（不正値は members にフォールバック）。
 */
export function parseSidebarTab(value: string | null): SidebarTab {
  const parsed = sidebarTabSchema.safeParse(value);
  return parsed.success ? parsed.data : "members";
}
