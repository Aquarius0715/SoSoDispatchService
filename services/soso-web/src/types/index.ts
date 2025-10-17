// Reservation MVP 用の最小型
export interface Reservation {
  id: string;
  title: string;
  start: string;
  end: string;
  members: string[];
  details?: string;
  departurePoint?: string;
  destinationPoint?: string;
}

export interface Member {
  id: string;
  memberName: string;
  hasCar: boolean;
  passengerNumber?: number;
}

// ポイント関連の型はMVPでは未使用として残すか、いったんコメントアウト
// export interface SOSOTransaction { /* unused for MVP */ }
// export interface EditedMemberData { /* unused for MVP */ }