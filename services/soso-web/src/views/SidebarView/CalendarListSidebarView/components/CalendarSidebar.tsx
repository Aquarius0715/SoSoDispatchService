// src/views/CalendarsSidebarView/components/CalendarsSidebarBody.tsx
"use client";

import React from "react";
import { SidebarContent } from "@/components/ui/sidebar";

import { UserStatusCard } from "./UserStatusCard";
import { RegisteredEventsCard } from "./RegisteredEventsCard";

export function CalendarsSidebar() {
  return (
    <div className="flex h-full flex-col">
      <SidebarContent className="flex-1 p-3">
        <div className="space-y-3">
          <UserStatusCard />
          <RegisteredEventsCard />
        </div>
      </SidebarContent>
    </div>
  );
}
