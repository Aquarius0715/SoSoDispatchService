export interface User {
  id: string;
  username: string;
  mailAddress: string;
  hasCar: boolean;
  capacity: number;
}

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