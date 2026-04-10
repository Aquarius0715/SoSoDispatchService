// src/views/CalendarsSidebarView/CalendarsSidebarView.tsx
"use client";

import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { CalendarsSidebar } from "./components/CalendarSidebar";

export default function CalendarsSidebarView() {
  return (
    <Sidebar
      collapsible="none"
      className="hidden h-full border-r lg:flex"
    >
      <CalendarsSidebar />
    </Sidebar>
  );
}
