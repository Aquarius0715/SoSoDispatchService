// src/views/HeaderView/useHeaderView.ts
"use client";

import { usePathname } from "next/navigation";
import { parseCalendarIdFromPathname } from "./schema";

export type HeaderViewState = {
  pathname: string;
  calendarId: string | null;
};

/**
 * HeaderView の表示に必要なルーティング情報をまとめる。
 */
export function useHeaderView(): HeaderViewState {
  const pathname = usePathname();
  const calendarId = parseCalendarIdFromPathname(pathname);

  return { pathname, calendarId };
}
