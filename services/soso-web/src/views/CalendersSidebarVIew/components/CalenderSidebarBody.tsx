// src/views/CalendersSidebarVIew/components/CalendersSidebarBody.tsx
"use client";

import React from "react";
import { SidebarContent } from "@/components/ui/sidebar";

import { UserStatusCard } from "../components/UserStatusCard";
import { RegisteredEventsCard } from "../components/RegisteredEventsCard";

export function CalendersSidebarBody() {
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
