// src/requests/calendarAPI.ts

import type { Calendar } from "@/types/interfaces";
import { apiGet, apiPost } from "./core/client";

export type CalendarCreateRequest = {
  name: string;
  description?: string;
};

/** 自分が所属するカレンダー一覧を取得 */
export async function getMyCalendars(): Promise<Calendar[]> {
  // OpenAPI: /calendars/my は bearer + csrf
  return apiGet<Calendar[]>("/calendars/my", { _auth: true, _csrf: false });
}

/** カレンダーを作成 */
export async function createCalendar(
  input: CalendarCreateRequest
): Promise<Calendar> {
  // OpenAPI: /calendars/create は bearer + csrf
  return apiPost<Calendar, CalendarCreateRequest>(
    "/calendars/create",
    input,
    { _auth: true, _csrf: true }
  );
}

/** カレンダー詳細を取得（招待ページ表示用） */
export async function getCalendarById(calendarId: string): Promise<Calendar> {
  return apiGet<Calendar>(`/calendars/${calendarId}`, { _auth: true, _csrf: true });
}

/** カレンダーに参加 */
export async function joinCalendar(calendarId: string): Promise<void> {
  await apiPost<void, Record<string, never>>(
    `/calendars/${calendarId}/join`,
    {},
    { _auth: true, _csrf: true }
  );
}
