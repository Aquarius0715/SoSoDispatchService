// src/types/interfaces.ts

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

export interface EventDetails {
  id: string;
  date: string;
  title: string;
  details: string;
  dropOffTime: string;
  pickUpTime: string;
  dropOffCount: number;
  pickUpCount: number;
  departurePoint: string;
  destinationPoint: string;
  members: string[];
  eventURL?: string;
  dispatchRegistered?: string[];
}

export interface EventStatus {
  date: string;
  title: string;
  details: string;
  dropOffTime: string;
  pickUpTime: string;
  dropOffCount: number;
  pickUpCount: number;
  departurePoint: string;
  destinationPoint: string;
  members: string[];
}

/** カレンダーイベント詳細用（FullCalendar 連携） */
export interface EventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  url?: string;
  extendedProps: {
    dropOffCount: number;
    pickUpCount: number;
    seatsRequiredGo: number;
    seatsRequiredReturn: number;
    participants: string[];
    description?: string;
    originLocation?: string;
    destinationLocation?: string;
  };
}

/** イベント参加者（フォーム用） */
export interface Participant {
  id: number;
  name: string;
  isChecked: boolean;
}

/** イベント追加フォームの状態（useMainView 用） */
export interface EventFormState {
  date: string;
  title: string;
  setTitle: (value: string) => void;
  details: string;
  setDetails: (value: string) => void;
  dropOffTime: string;
  setDropOffTime: (value: string) => void;
  pickUpTime: string;
  setPickUpTime: (value: string) => void;
  dropOffCount: number;
  setDropOffCount: (value: number) => void;
  pickUpCount: number;
  setPickUpCount: (value: number) => void;
  departurePoint: string;
  setDeparturePoint: (value: string) => void;
  destinationPoint: string;
  setDestinationPoint: (value: string) => void;
  participants: Participant[];
}
