// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/members/useMemberListPanel.ts
"use client";

import useSWR from "swr";

import { listCalendarMembers } from "@/requests/calendarDetailAPI";
import {
  calendarMemberListSchema,
  type CalendarMember,
} from "./schema";

export type UseMemberListPanelResult = {
  members: CalendarMember[];
  isLoading: boolean;
  error: unknown;
};

async function fetchMembers(calendarId: string): Promise<CalendarMember[]> {
  const raw = (await listCalendarMembers(calendarId)) as unknown;
  return calendarMemberListSchema.parse(raw);
}

export function useMemberListPanel(calendarId: string): UseMemberListPanelResult {
  const { data, error, isLoading } = useSWR<CalendarMember[]>(
    calendarId ? ["calendarMembers", calendarId] : null,
    () => fetchMembers(calendarId)
  );

  return {
    members: data ?? [],
    isLoading,
    error,
  };
}
