// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/CalendarDetailSidebarBody.tsx
"use client";

import React from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarContent } from "@/components/ui/sidebar";

import { useCalendarDetailSidebar } from "./useCalendarDetailSidebar";
import { MemberListPanel } from "./MembersListPanel/MemberListPanel";
import { SoSoPointTimelinePanel } from "./SoSoPointTimelinePanel/SoSoPointTimelinePanel";
import { SidebarMainCard } from "./components/SidebarMainCard";
import { SidebarTabFooter } from "./components/SidebarTabFooter";

type Props = {
  calendarId: string;
};

export function CalendarDetailSidebar({ calendarId }: Props) {
  const { tab, title, setTab } = useCalendarDetailSidebar();

  return (
    <div className="flex h-full flex-col">
      <SidebarContent className="flex-1 p-3">
        <SidebarMainCard title={title}>
          {tab === "members" ? (
            <MemberListPanel calendarId={calendarId} />
          ) : (
            <SoSoPointTimelinePanel calendarId={calendarId} />
          )}
        </SidebarMainCard>
      </SidebarContent>

      <Separator />

      <SidebarTabFooter tab={tab} onTabChange={setTab} />
    </div>
  );
}
