// src/requests/userAPI.ts
import { User } from "@/types/interfaces";
import { apiGet, apiPatch, apiPost } from "./core/client";

export interface RegisterUserRequest {
  username: string;
  mailAddress: string;
  password: string;
  hasCar: boolean;
  capacity: number;
}

export type UpdateMeRequest = {
  username: string;
  // mailAddress は更新しない前提なら送らなくてOK（APIが必須なら入れる）
  mailAddress?: string;
  hasCar: boolean;
  capacity: number;
};

export async function registerUser(input: RegisterUserRequest): Promise<User> {
  return apiPost<User, RegisterUserRequest>("/users/register", input);
}

export async function getMe(): Promise<User> {
  return apiGet<User>("/users/me", { _auth: true });
}

export async function updateMe(input: UpdateMeRequest): Promise<User> {
  return apiPatch<User, UpdateMeRequest>("/users/me", input, { _auth: true });

}