// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/CalenderDetailSidebarBody.tsx
"use client";

import React from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarContent } from "@/components/ui/sidebar";

import { useCalenderDetailSidebar } from "./useCalenderDetailSidebar";
import { MemberListPanel } from "./members/MemberListPanel";
import { SosoPointTimelinePanel } from "./timeline/SosoPointTimelinePanel";
import { SidebarMainCard } from "./components/SidebarMainCard";
import { SidebarTabFooter } from "./components/SidebarTabFooter";

type Props = {
  calenderId: string;
};

export function CalenderDetailSidebarView({ calenderId }: Props) {
  const { tab, title, description, makeHref } = useCalenderDetailSidebar();

  return (
    <div className="flex h-full flex-col">
      <SidebarContent className="flex-1 p-3">
        <SidebarMainCard title={title} description={description}>
          {tab === "members" ? (
            <MemberListPanel calenderId={calenderId} />
          ) : (
            <SosoPointTimelinePanel calenderId={calenderId} />
          )}
        </SidebarMainCard>
      </SidebarContent>

      <Separator />

      <SidebarTabFooter tab={tab} makeHref={makeHref} />
    </div>
  );
}
