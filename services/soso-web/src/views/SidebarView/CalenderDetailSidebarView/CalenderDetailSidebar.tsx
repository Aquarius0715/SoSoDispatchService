// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/CalenderDetailSidebarBody.tsx
"use client";

import React from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarContent } from "@/components/ui/sidebar";

import { useCalenderDetailSidebar } from "./useCalenderDetailSidebar";
import { MemberListPanel } from "./MembersListPanel/MemberListPanel";
import { SoSoPointTimelinePanel } from "./SoSoPointTimelinePanel/SoSoPointTimelinePanel";
import { SidebarMainCard } from "./components/SidebarMainCard";
import { SidebarTabFooter } from "./components/SidebarTabFooter";

type Props = {
  calenderId: string;
};

export function CalenderDetailSidebar({ calenderId }: Props) {
  const { tab, title, setTab } = useCalenderDetailSidebar();

  return (
    <div className="flex h-full flex-col">
      <SidebarContent className="flex-1 p-3">
        <SidebarMainCard title={title}>
          {tab === "members" ? (
            <MemberListPanel calenderId={calenderId} />
          ) : (
            <SoSoPointTimelinePanel calenderId={calenderId} />
          )}
        </SidebarMainCard>
      </SidebarContent>

      <Separator />

      <SidebarTabFooter tab={tab} onTabChange={setTab} />
    </div>
  );
}
