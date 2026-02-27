// src/views/CalendersSidebarVIew/CalendersSidebarView.tsx
"use client";

import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { CalendersSidebar } from "./components/CalenderSidebar";

export default function CalendersSidebarView() {
  return (
    <Sidebar
      collapsible="none"
      className="hidden h-full border-r lg:flex"
    >
      <CalendersSidebar />
    </Sidebar>
  );
}
