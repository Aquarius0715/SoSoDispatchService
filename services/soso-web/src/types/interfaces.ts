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

export interface Calender {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CalenderMember = {
  id: string;
  username: string;
  hasCar: boolean;
  capacity: number;
  sosoPoint: number;
};

export type SosoPointHistory = {
  id: number;
  calenderId: string;
  userId: string;
  changedAt: string;
  changedBy?: string;
  eventId?: string;
  oldPoint: number;
  newPoint: number;
  pointDelta?: number;
  reason?: string;
};
