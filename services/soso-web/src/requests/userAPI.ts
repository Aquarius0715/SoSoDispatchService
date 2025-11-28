// src/requests/userAPI.ts
import { createEndpoint } from "./core/endpoint";

/**
 * RegisterRequest (OpenAPI より)
 * - username:    string
 * - mailAddress: string (email)
 * - password:    string
 * - hasCar:      boolean
 * - capacity:    number (0 以上, 任意)
 */
export interface RegisterUserRequest {
  username: string;
  mailAddress: string;
  password: string;
  hasCar: boolean;
  capacity?: number; // hasCar=false のときは 0 or 未指定でよさそう
}

/**
 * User (OpenAPI より)
 */
export interface User {
  id: string;          // uuid
  username: string;
  mailAddress: string;
  hasCar: boolean;
  capacity: number;
  createdAt: string;   // date-time
  updatedAt: string;   // date-time
}

/**
 * POST /users/register
 * - CSRF 必須
 * - 認証は不要
 */
export const registerUser = createEndpoint<RegisterUserRequest, User>(
  "POST",
  "/users/register",
  {
    auth: false,
    csrf: true,
  },
);
