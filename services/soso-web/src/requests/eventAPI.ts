import { createEndpoint } from "./core/endpoint";

// ==========================================
// 1. 型定義 (Swagger Schemas に準拠)
// ==========================================

/**
 * EventCreateRequest
 * イベント作成時のリクエストボディ
 */
export interface EventCreateRequest {
  title: string;
  description?: string;
  startTime: string;           // date-time (ISO 8601)
  endTime: string;             // date-time (ISO 8601)
  originLocation: string;
  destinationLocation: string;
  seatsRequiredGo: number;     // integer
  seatsRequiredReturn: number; // integer
  participantUserIds: string[]; // UUID array
}

/**
 * Event (Response)
 * 基本的なイベント情報 (GET /events, POST /events のレスポンス)
 */
export interface Event {
  id: string;                  // uuid
  calenderId: string;          // uuid
  creatorId: string;           // uuid
  title: string;
  description: string;
  startTime: string;           // date-time
  endTime: string;             // date-time
  originLocation: string;
  destinationLocation: string;
  seatsRequiredGo: number;     // integer
  seatsRequiredReturn: number; // integer
  participantUserIds: string[]; // uuid array
}

/**
 * EventDetail (Response)
 * 詳細画面用 (Event を拡張し、残席数などを追加)
 * Swagger: allOf [Event, { remainingGoSeats, ... }]
 */
export interface EventDetail extends Event {
  remainingGoSeats: number;     // integer
  remainingReturnSeats: number; // integer
  participants: string[];       // 参加者の名前リスト (Swagger定義に基づく)
}


// ==========================================
// 2. エンドポイント定義
// ==========================================

/**
 * イベント作成
 * POST /calenders/{calender_id}/events
 * Response: Event
 */
export const createEvent = (calenderId: string) => 
  createEndpoint<EventCreateRequest, Event>(
    "POST", 
    `/calenders/${calenderId}/events`, 
    { auth: true }
  );

/**
 * イベント詳細取得
 * GET /events/{event_id}/detail
 * Response: EventDetail
 */
export const getEventDetail = (eventId: string) => 
  createEndpoint<void, EventDetail>(
    "GET", 
    `/events/${eventId}/detail`, 
    { auth: true }
  );

/**
 * 迎えドライバー（行き）への登録
 * POST /events/{event_id}/pickup
 * Response: void (201 Created)
 */
export const registerPickupDriver = (eventId: string) => 
  createEndpoint<void, void>(
    "POST", 
    `/events/${eventId}/pickup`, 
    { auth: true }
  );

/**
 * 送りドライバー（帰り）への登録
 * POST /events/{event_id}/return
 * Response: void (201 Created)
 */
export const registerReturnDriver = (eventId: string) => 
  createEndpoint<void, void>(
    "POST", 
    `/events/${eventId}/return`, 
    { auth: true }
  );

/**
 * イベント一覧取得
 * GET /calenders/{calender_id}/events
 * Response: Event[] (Array of Event)
 */
export const listEvents = (calenderId: string) =>
  createEndpoint<void, Event[]>(
    "GET",
    `/calenders/${calenderId}/events`,
    { auth: true }
  );