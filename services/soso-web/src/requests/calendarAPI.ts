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
  return apiGet<Calendar[]>("/calendars/my", { _auth: true, _csrf: true });
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
