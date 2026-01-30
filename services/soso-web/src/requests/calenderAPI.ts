// src/requests/calenderAPI.ts

import type { Calender } from "@/types/interfaces";
import { apiGet, apiPost } from "./core/client";

export type CalenderCreateRequest = {
  name: string;
  description?: string;
};

/** 自分が所属するカレンダー一覧を取得 */
export async function getMyCalenders(): Promise<Calender[]> {
  // OpenAPI: /calenders/my は bearer + csrf
  return apiGet<Calender[]>("/calenders/my", { _auth: true, _csrf: true });
}

/** カレンダーを作成 */
export async function createCalender(
  input: CalenderCreateRequest
): Promise<Calender> {
  // OpenAPI: /calenders/create は bearer + csrf
  return apiPost<Calender, CalenderCreateRequest>(
    "/calenders/create",
    input,
    { _auth: true, _csrf: true }
  );
}
