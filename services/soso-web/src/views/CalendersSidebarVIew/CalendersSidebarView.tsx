"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";

import { UserStatusCard } from "./components/UserStatusCard";
import { RegisteredEventsCard } from "./components/RegisteredEventsCard";

export default function CalendersSidebarView() {
  return (
    <Sidebar
      collapsible="none"
      className="h-full border-r"
    >
      <div className="flex h-full flex-col">
        <SidebarContent className="flex-1 p-3">
          <div className="space-y-3">
            <UserStatusCard />
            <RegisteredEventsCard />
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
