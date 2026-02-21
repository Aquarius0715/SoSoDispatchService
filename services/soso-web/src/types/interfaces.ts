// src/types/interfaces.ts

// --- 基本エンティティ (APIレスポンスに近い形) ---

export interface User {
  id: string;
  username: string;
  mailAddress: string;
  hasCar: boolean;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Calendar {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CalendarMember = {
  id: string;
  username: string;
  hasCar: boolean;
  capacity: number;
  sosoPoint: number;
};

export type SosoPointHistory = {
  id: number;
  calendarId: string;
  userId: string;
  changedAt: string;
  changedBy?: string;
  eventId?: string;
  oldPoint: number;
  newPoint: number;
  pointDelta?: number;
  reason?: string;
};

// --- アプリケーション内での表示用データ構造 ---

/** * カレンダーイベント詳細用（FullCalendar 連携） 
 * useDashboardView で API からのデータをこれに変換して保持します。
 */
export interface EventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  url?: string; // 任意: クリック時のリンクなど
  
  // FullCalendar の標準フィールド以外はここに詰めます
  extendedProps: {
    // 必須項目 (APIの Event 型にあるもの)
    // 送り/迎えの対応: Go = 迎え(pickup), Return = 送り(dropOff)
    seatsRequiredGo: number; // 全体の迎え人数
    seatsRequiredReturn: number; // 全体の送り人数
    originLocation: string;
    destinationLocation: string;
    description?: string;
    participants: string[]; // 参加者名の配列 または ID配列

    // 詳細API取得後に追加される可能性のある項目 (Optional)
    remainingGoSeats?: number;     // 迎えの残席 (Go = 迎え)
    remainingReturnSeats?: number; // 送りの残席 (Return = 送り)
    dropOffCount?: number;         // 送り人数の別名 (Return と同値)
    pickUpCount?: number;          // 迎え人数の別名 (Go と同値)
  };
}

// --- 以下は不要になった、または使われていない型 (削除済み) ---

// EventStatus は EventData と役割が被っているため削除検討
// EventFormState は React Hook Form に置き換わったため削除推奨
// Participant は string[] (ID配列) で管理するようになったため削除推奨

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
 * 基本的なイベント情報。Swagger Event に準拠。
 * 注: API は calenderId という typo で返す場合がある。必要ならレスポンス時に calendarId にマッピングすること。
 */
export interface Event {
  id: string;                  // uuid
  calendarId: string;          // uuid (API は calenderId で返す場合あり)
  creatorId: string;           // uuid
  title: string;
  description: string;
  startTime: string;           // date-time
  endTime: string;             // date-time
  originLocation: string;
  destinationLocation: string;
  /** Swagger には未記載だが API が返す場合あり */
  goDrivers?: GoDrivers[];
  returnDrivers?: GoDrivers[];
  seatsRequiredGo: number;     // integer
  seatsRequiredReturn: number; // integer
  participantUserIds: string[]; // uuid array
}

export interface GoDrivers {
  userId: string,
  username: string,
  capacity: number
}

/**
 * EventDetail (Response)
 * GET /events/{event_id}/detail のレスポンス型。
 * Swagger components.schemas.EventDetail に準拠（Event + remainingGoSeats, remainingReturnSeats, participants）。
 */
export interface EventDetail extends Event {
  remainingGoSeats: number;     // integer
  remainingReturnSeats: number; // integer
  participants: string[];       // 参加者の名前リスト (Swagger定義に基づく)
}