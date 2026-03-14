// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/CalendarDetailSidebarView.tsx
"use client";

import React from "react";

import { Sidebar } from "@/components/ui/sidebar";

import { CalendarDetailSidebar } from "./CalendarDetailSidebar";

type Props = {
  calendarId: string;
};

/**
 * /calendars/[id] 専用サイドバー（デスクトップ表示）
 * - モバイルは Header の Sheet から開くため、ここは md 以上のみ表示
 */
export function CalendarDetailSidebarView({ calendarId }: Props) {
  return (
    <Sidebar collapsible="none" className="hidden h-full border-r md:flex">
      <CalendarDetailSidebar calendarId={calendarId} />
    </Sidebar>
  );
}
