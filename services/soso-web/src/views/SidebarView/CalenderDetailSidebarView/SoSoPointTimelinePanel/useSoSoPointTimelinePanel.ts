// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/timeline/useSosoPointTimelinePanel.ts
"use client";

import useSWR from "swr";

import {
  listCalenderMembers,
  listSosoPointHistory,
} from "@/requests/calenderDetailAPI";

import { calenderMemberListSchema, type CalenderMember } from "../MembersListPanel/schema";
import { sosoPointHistoryListSchema, type SosoPointHistory as SoSoPointHistory } from "./schema";

export type UseSoSoPointTimelinePanelResult = {
  members: CalenderMember[];
  histories: SoSoPointHistory[];
  isLoading: boolean;
  error: unknown;
};

async function fetchMembers(calenderId: string): Promise<CalenderMember[]> {
  const raw = (await listCalenderMembers(calenderId)) as unknown;
  return calenderMemberListSchema.parse(raw);
}

async function fetchHistories(calenderId: string): Promise<SoSoPointHistory[]> {
  const raw = (await listSosoPointHistory(calenderId)) as unknown;
  return sosoPointHistoryListSchema.parse(raw);
}

export function useSoSoPointTimelinePanel(
  calenderId: string
): UseSoSoPointTimelinePanelResult {
  const membersSWR = useSWR<CalenderMember[]>(
    calenderId ? ["calenderMembers", calenderId] : null,
    () => fetchMembers(calenderId)
  );

  const historiesSWR = useSWR<SoSoPointHistory[]>(
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
