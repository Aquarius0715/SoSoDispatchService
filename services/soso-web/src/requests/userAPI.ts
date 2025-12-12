// src/requests/userAPI.ts
import { apiClient } from "./core/client";

// --- Types ---
// 必要に応じて定義を追加してください
export interface User {
  id: string;
  username: string;
  mailAddress: string;
  hasCar: boolean;
  capacity: number;
}

export interface RegisterUserRequest {
  username: string;
  mailAddress: string;
  password: string;
  hasCar: boolean;
  capacity: number;
}

// --- API Functions ---

/**
 * ユーザー登録
 */
export async function registerUser(input: RegisterUserRequest): Promise<User> {
  // _auth: false (デフォルト), POSTなのでCSRFトークンは自動付与
  const res = await apiClient.post<User>("/users/signup", input); 
  // ※エンドポイントパス(/users/signup)はバックエンドに合わせて調整してください
  return res as unknown as User;
}

/**
 * 自分の情報を取得
 */
export async function getMe(): Promise<User> {
  // _auth: true でアクセストークン付与
  const res = await apiClient.get<User>("/users/me", { _auth: true } as any);
  return res as unknown as User;
}