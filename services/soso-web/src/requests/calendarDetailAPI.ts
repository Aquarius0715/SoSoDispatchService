// src/requests/calendarDetailAPI.ts
import { apiGet } from "@/requests/core/client";
import type { CalendarMember, SosoPointHistory } from "@/types/interfaces";

/**
 * カレンダーのメンバー一覧を取得
 * GET /calendars/{calendar_id}/members
 */
export async function listCalendarMembers(
  calendarId: string
): Promise<CalendarMember[]> {
  return apiGet<CalendarMember[]>(`/calendars/${calendarId}/members`, {
    _auth: true,
    _csrf: false,
  });
}

/**
 * SOSoポイント履歴（タイムライン）を取得
 * GET /calendars/{calendar_id}/soso_point_history
 */
export async function listSosoPointHistory(
  calendarId: string
): Promise<SosoPointHistory[]> {
  return apiGet<SosoPointHistory[]>(
    `/calendars/${calendarId}/soso_point_history`,
    {
      _auth: true,
      _csrf: false,
    }
  );
}
