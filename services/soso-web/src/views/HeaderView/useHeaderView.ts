// src/views/HeaderView/useHeaderView.ts
"use client";

import { usePathname } from "next/navigation";
import { parseCalenderIdFromPathname } from "./schema";

export type HeaderViewState = {
  pathname: string;
  calenderId: string | null;
};

/**
 * HeaderView の表示に必要なルーティング情報をまとめる。
 */
export function useHeaderView(): HeaderViewState {
  const pathname = usePathname();
  const calenderId = parseCalenderIdFromPathname(pathname);

  return { pathname, calenderId };
}
