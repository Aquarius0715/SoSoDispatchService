import { EventInput } from '@fullcalendar/core';

// EventAddModal と page.tsx で使用するイベント作成時のデータ型
export interface EventStatus {
  title: string;
  details: string;
  dropOffTime: string;
  pickUpTime: string;
  dropOffCount: string;
  pickUpCount: string;
  departurePoint: string;
  destinationPoint: string;
  members: string[];
}

// EventDetailModal で使用するイベント詳細データの型
export interface EventDetails {
  id: string; // イベントを特定するためのID
  EventTitle: string;
  EventDate: string;
  EventTime: string;
  EventDetail: string;
  EventURL: string;
  member: string[];
  DropOffNumber: number;
  PickUpNumber: number;
  departurePoint: string;
  destination: string;
  dispatchRegistered: string[];
}

// 左サイドバーで使用するメンバーの型
export interface Member {
  id: number;
  memberName: string;
  hasCar: boolean;
  passengerNumber?: number;
  sosoPoint: number;
}

// 右サイドバーで使用するSOSO履歴の型
export interface SOSOTransaction {
  id: number;
  eventName: string;
  date: string;
  time: string;
  changer: string;
  changee: string;
  sosoPoints: number;
  reason: string;
}

// SOSO編集モーダルから受け取るデータの型
export interface EditedMemberData extends Member {
  reason: string;
}