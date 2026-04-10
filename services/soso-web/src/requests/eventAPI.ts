// src/requests/eventAPI.ts

import type { EventCreateRequest, Event, EventDetail } from "@/types/interfaces";
import { apiGet, apiPost } from "./core/client";

/** イベント作成 */
export async function createEvent(
  calendarId: string,
  request: EventCreateRequest
): Promise<Event> {
  return apiPost<Event, EventCreateRequest>(
    `/calendars/${calendarId}/events`,
    request,
    { _auth: true, _csrf: true }
  );
}

/** イベント一覧取得 */
export async function listEvents(calendarId: string): Promise<Event[]> {
  return apiGet<Event[]>(
    `/calendars/${calendarId}/events`,
    { _auth: true }
  );
}

/** イベント詳細を取得 */
export async function getEventDetail(eventId: string): Promise<EventDetail> {
  return apiGet<EventDetail>(`/events/${eventId}/detail`, {
    _auth: true,
    _csrf: true,
  });
}

/** 参加者のみ登録（送り迎え不要） */
export async function registerParticipant(eventId: string): Promise<void> {
  await apiPost<void>(`/events/${eventId}/participate`, {}, { _auth: true, _csrf: true });
}

/** 行きドライバー登録 */
export async function registerGoDriver(eventId: string): Promise<void> {
  await apiPost<void>(`/events/${eventId}/go-driver`, {}, { _auth: true, _csrf: true });
}

/** 帰りドライバー登録 */
export async function registerReturnDriver(eventId: string): Promise<void> {
  await apiPost<void>(`/events/${eventId}/return-driver`, {}, { _auth: true, _csrf: true });
}

/** 両方ドライバー登録 */
export async function registerBothDriver(eventId: string): Promise<void> {
  await apiPost<void>(`/events/${eventId}/both-driver`, {}, { _auth: true, _csrf: true });
}

/** 行き同乗者登録 */
export async function registerGoRider(eventId: string): Promise<void> {
  await apiPost<void>(`/events/${eventId}/go-rider`, {}, { _auth: true, _csrf: true });
}

/** 帰り同乗者登録 */
export async function registerReturnRider(eventId: string): Promise<void> {
  await apiPost<void>(`/events/${eventId}/return-rider`, {}, { _auth: true, _csrf: true });
}

/** 両方同乗者登録 */
export async function registerBothRider(eventId: string): Promise<void> {
  await apiPost<void>(`/events/${eventId}/both-rider`, {}, { _auth: true, _csrf: true });
}
