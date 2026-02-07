// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/timeline/useSosoPointTimelinePanel.ts
"use client";

import useSWR from "swr";

import {
  listCalendarMembers,
  listSosoPointHistory,
} from "@/requests/calendarDetailAPI";

import { calendarMemberListSchema, type CalendarMember } from "../MembersListPanel/schema";
import { sosoPointHistoryListSchema, type SosoPointHistory as SoSoPointHistory } from "./schema";

export type UseSoSoPointTimelinePanelResult = {
  members: CalendarMember[];
  histories: SoSoPointHistory[];
  isLoading: boolean;
  error: unknown;
};

async function fetchMembers(calendarId: string): Promise<CalendarMember[]> {
  const raw = (await listCalendarMembers(calendarId)) as unknown;
  return calendarMemberListSchema.parse(raw);
}

async function fetchHistories(calendarId: string): Promise<SoSoPointHistory[]> {
  const raw = (await listSosoPointHistory(calendarId)) as unknown;
  return sosoPointHistoryListSchema.parse(raw);
}

export function useSoSoPointTimelinePanel(
  calendarId: string
): UseSoSoPointTimelinePanelResult {
  const membersSWR = useSWR<CalendarMember[]>(
    calendarId ? ["calendarMembers", calendarId] : null,
    () => fetchMembers(calendarId)
  );

  const historiesSWR = useSWR<SoSoPointHistory[]>(
    calendarId ? ["sosoPointHistory", calendarId] : null,
    () => fetchHistories(calendarId)
  );

  return {
    members: membersSWR.data ?? [],
    histories: historiesSWR.data ?? [],
    isLoading: membersSWR.isLoading || historiesSWR.isLoading,
    error: membersSWR.error || historiesSWR.error,
  };
}
