// src/requests/eventAPI.ts

import type { EventDetail } from "@/types/interfaces";
import { apiGet, apiPost } from "./core/client";

/** イベント詳細を取得 */
export async function getEventDetail(eventId: string): Promise<EventDetail> {
  return apiGet<EventDetail>(`/events/${eventId}/detail`, {
    _auth: true,
    _csrf: true,
  });
}

/** 行きドライバー登録 */
export async function registerPickUp(eventId: string): Promise<void> {
  await apiPost<void>(`/events/${eventId}/pickup`, {}, { _auth: true, _csrf: true });
}

/** 帰りドライバー登録 */
export async function registerReturn(eventId: string): Promise<void> {
  await apiPost<void>(`/events/${eventId}/return`, {}, { _auth: true, _csrf: true });
}

/** 両方ドライバー登録 */
export async function registerBoth(eventId: string): Promise<void> {
  await apiPost<void>(`/events/${eventId}/both`, {}, { _auth: true, _csrf: true });
}
