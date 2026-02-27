// src/requests/calenderDetailAPI.ts
import { apiGet } from "@/requests/core/client";
import type { CalenderMember, SosoPointHistory } from "@/types/interfaces";

/**
 * カレンダーのメンバー一覧を取得
 * GET /calenders/{calender_id}/members
 */
export async function listCalenderMembers(
  calenderId: string
): Promise<CalenderMember[]> {
  return apiGet<CalenderMember[]>(`/calenders/${calenderId}/members`, {
    _auth: true,
    _csrf: true,
  });
}

/**
 * SOSoポイント履歴（タイムライン）を取得
 * GET /calenders/{calender_id}/soso_point_history
 */
export async function listSosoPointHistory(
  calenderId: string
): Promise<SosoPointHistory[]> {
  return apiGet<SosoPointHistory[]>(
    `/calenders/${calenderId}/soso_point_history`,
    {
      _auth: true,
      _csrf: true,
    }
  );
}
