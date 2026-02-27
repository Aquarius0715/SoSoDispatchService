// src/views/HeaderView/schema.ts

import { z } from "zod";

/**
 * calenderId を UUID として扱うためのスキーマ。
 */
export const calenderIdSchema = z.string().uuid();

/**
 * pathname から calenderId を取り出す。
 *
 * pathname examples:
 * - /calenders
 * - /calenders/<uuid>
 * - /calenders/<uuid>/events
 */
export function parseCalenderIdFromPathname(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "calenders") return null;

  const id = parts[1];
  if (!id) return null;

  const parsed = calenderIdSchema.safeParse(id);
  return parsed.success ? parsed.data : null;
}
