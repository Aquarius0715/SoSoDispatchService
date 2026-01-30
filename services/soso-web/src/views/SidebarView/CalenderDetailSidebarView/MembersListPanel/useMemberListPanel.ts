// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/members/useMemberListPanel.ts
"use client";

import useSWR from "swr";

import { listCalenderMembers } from "@/requests/calenderDetailAPI";
import {
  calenderMemberListSchema,
  type CalenderMember,
} from "./schema";

export type UseMemberListPanelResult = {
  members: CalenderMember[];
  isLoading: boolean;
  error: unknown;
};

async function fetchMembers(calenderId: string): Promise<CalenderMember[]> {
  const raw = (await listCalenderMembers(calenderId)) as unknown;
  return calenderMemberListSchema.parse(raw);
}

export function useMemberListPanel(calenderId: string): UseMemberListPanelResult {
  const { data, error, isLoading } = useSWR<CalenderMember[]>(
    calenderId ? ["calenderMembers", calenderId] : null,
    () => fetchMembers(calenderId)
  );

  return {
    members: data ?? [],
    isLoading,
    error,
  };
}
