export interface SOSOTransaction {
  id: string;
  description: string;
  amount?: number;
  date?: string;
  [key: string]: any;
}

