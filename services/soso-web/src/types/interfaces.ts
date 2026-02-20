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
    seatsRequiredGo: number;
    seatsRequiredReturn: number;
    originLocation: string;
    destinationLocation: string;
    description?: string;
    participants: string[]; // 参加者名の配列 または ID配列

    // 詳細API取得後に追加される可能性のある項目 (Optional)
    remainingGoSeats?: number;     // 行きの残席
    remainingReturnSeats?: number; // 帰りの残席
    dropOffCount?: number;         // (互換性用)
    pickUpCount?: number;          // (互換性用)
  };
}

/** * イベント詳細ダイアログ表示用
 * EventData よりもリッチな情報（詳細APIのレスポンスなど）を扱う場合に使用
 */
export interface EventDetails {
  id: string;
  title: string;
  date: Date;        // string ではなく Date オブジェクトで統一したほうが扱いやすい
  startTime: Date;
  endTime: Date;
  description: string;
  origin: string;      // originLocation のエイリアス
  destination: string; // destinationLocation のエイリアス
  
  // 座席情報
  remainingGo: number;
  remainingReturn: number;
  totalGo: number;
  totalReturn: number;
  
  participants: string[];
  url?: string;
}

// --- 以下は不要になった、または使われていない型 (削除推奨) ---

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
 * 基本的なイベント情報 (GET /events, POST /events のレスポンス)
 */
export interface Event {
  id: string;                  // uuid
  calendarId: string;          // uuid
  creatorId: string;           // uuid
  title: string;
  description: string;
  startTime: string;           // date-time
  endTime: string;             // date-time
  originLocation: string;
  destinationLocation: string;
  goDrivers: GoDrivers[]; // goDrivers: {[{}]}
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
 * 詳細画面用 (Event を拡張し、残席数などを追加)
 * Swagger: allOf [Event, { remainingGoSeats, ... }]
 */
export interface EventDetail extends Event {
  remainingGoSeats: number;     // integer
  remainingReturnSeats: number; // integer
  participants: string[];       // 参加者の名前リスト (Swagger定義に基づく)
}