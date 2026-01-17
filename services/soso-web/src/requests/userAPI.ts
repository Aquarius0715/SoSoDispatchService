// src/requests/userAPI.ts
import { User } from "@/types/interfaces";
import { apiGet, apiPost } from "./core/client";

export interface RegisterUserRequest {
  username: string;
  mailAddress: string;
  password: string;
  hasCar: boolean;
  capacity: number;
}

export async function registerUser(input: RegisterUserRequest): Promise<User> {
  return apiPost<User, RegisterUserRequest>("/users/register", input);
}

export async function getMe(): Promise<User> {
  return apiGet<User>("/users/me", { _auth: true });
}