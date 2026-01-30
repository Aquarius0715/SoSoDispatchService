// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/timeline/useSosoPointTimelinePanel.ts
"use client";

import useSWR from "swr";

import {
  listCalenderMembers,
  listSosoPointHistory,
} from "@/requests/calenderDetailAPI";

import { calenderMemberListSchema, type CalenderMember } from "../members/schema";
import { sosoPointHistoryListSchema, type SosoPointHistory } from "./schema";

export type UseSosoPointTimelinePanelResult = {
  members: CalenderMember[];
  histories: SosoPointHistory[];
  isLoading: boolean;
  error: unknown;
};

async function fetchMembers(calenderId: string): Promise<CalenderMember[]> {
  const raw = (await listCalenderMembers(calenderId)) as unknown;
  return calenderMemberListSchema.parse(raw);
}

async function fetchHistories(calenderId: string): Promise<SosoPointHistory[]> {
  const raw = (await listSosoPointHistory(calenderId)) as unknown;
  return sosoPointHistoryListSchema.parse(raw);
}

export function useSosoPointTimelinePanel(
  calenderId: string
): UseSosoPointTimelinePanelResult {
  const membersSWR = useSWR<CalenderMember[]>(
    calenderId ? ["calenderMembers", calenderId] : null,
    () => fetchMembers(calenderId)
  );

  const historiesSWR = useSWR<SosoPointHistory[]>(
    calenderId ? ["sosoPointHistory", calenderId] : null,
    () => fetchHistories(calenderId)
  );

  return {
    members: membersSWR.data ?? [],
    histories: historiesSWR.data ?? [],
    isLoading: membersSWR.isLoading || historiesSWR.isLoading,
    error: membersSWR.error || historiesSWR.error,
  };
}
