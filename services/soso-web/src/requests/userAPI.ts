// src/requests/userAPI.ts
import { User } from "@/types/interfaces";
import { apiClient } from "./core/client";


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
  const res = await apiClient.post<User>("/users/register", input); 
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