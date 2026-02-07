// src/views/HeaderView/schema.ts

import { z } from "zod";

/**
 * calendarId を UUID として扱うためのスキーマ。
 */
export const calendarIdSchema = z.string().uuid();

/**
 * pathname から calendarId を取り出す。
 *
 * pathname examples:
 * - /calendars
 * - /calendars/<uuid>
 * - /calendars/<uuid>/events
 */
export function parseCalendarIdFromPathname(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "calendars") return null;

  const id = parts[1];
  if (!id) return null;

  const parsed = calendarIdSchema.safeParse(id);
  return parsed.success ? parsed.data : null;
}
