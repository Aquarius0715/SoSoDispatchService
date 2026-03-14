import { createEndpoint } from "./core/endpoint";
import { EventCreateRequest, Event, EventDetail } from "@/types/interfaces";
import { apiPost, apiGet } from "./core/client";


// ==========================================
// 2. エンドポイント定義
// ==========================================

/**
 * イベント作成
 * POST /calendars/{calendar_id}/events
 * Response: Event
 */
// export const createEvent = (calendarId: string) => 
//   createEndpoint<EventCreateRequest, Event>(
//     "POST", 
//     `/calendars/${calendarId}/events`, 
//     { auth: true, csrf: true }
//   );
export async function createEvent(
  calendarId: string, 
  request: EventCreateRequest
): Promise<Event> {
  return apiPost<Event, EventCreateRequest>(
    `/calendars/${calendarId}/events`,
    request,
    { _auth: true, _csrf: true }
  )
}


/**
 * イベント詳細取得
 * GET /events/{event_id}/detail
 * Response: EventDetail
 */
// export const getEventDetail = (eventId: string) => 
//   createEndpoint<void, EventDetail>(
//     "GET", 
//     `/events/${eventId}/detail`, 
//     { auth: true }
//   );
export async function getEventDetail(eventId: string): Promise<EventDetail> {
  return apiGet<EventDetail>(
    `/events/${eventId}/detail`,
    { _auth: true }
  )
}

/**
 * 迎えドライバー（行き）への登録
 * POST /events/{event_id}/pickup
 * Response: void (201 Created)
 */
// export const registerPickupDriver = (eventId: string) => 
//   createEndpoint<void, void>(
//     "POST", 
//     `/events/${eventId}/pickup`, 
//     { auth: true }
//   );
export async function registerPickupDriver(eventId: string): Promise<void> {
  return apiPost<void>(
    `/events/${eventId}/pickup`,
    undefined,
    { _auth: true, _csrf: true }
  );
}

/**
 * 送りドライバー（帰り）への登録
 * POST /events/{event_id}/return
 * Response: void (201 Created)
 */
// export const registerReturnDriver = (eventId: string) => 
//   createEndpoint<void, void>(
//     "POST", 
//     `/events/${eventId}/return`, 
//     { auth: true }
//   );
export async function registerReturnDriver(eventId: string): Promise<void> {
  return apiPost<void>(
    `/events/${eventId}/return`,
    undefined,
    { _auth: true, _csrf: true }
  );
}

/**
 * イベント一覧取得
 * GET /calendars/{calendar_id}/events
 * Response: Event[] (Array of Event)
 */
// export const listEvents = (calendarId: string) =>
//   createEndpoint<void, Event[]>(
//     "GET",
//     `/calendars/${calendarId}/events`,
//     { auth: true }
//   );
export async function listEvents(calendarId: string): Promise<Event[]> {
  return apiGet<Event[]>(
    `/calendars/${calendarId}/events`,
    { _auth: true }
  )
}