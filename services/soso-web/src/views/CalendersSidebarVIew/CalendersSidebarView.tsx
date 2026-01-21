// src/views/CalendersSidebarVIew/CalendersSidebarView.tsx
"use client";

import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { CalendersSidebarBody } from "./components/CalenderSidebarBody";

export default function CalendersSidebarView() {
  return (
    <Sidebar
      collapsible="none"
      className="hidden h-full border-r md:flex"
    >
      <CalendersSidebarBody />
    </Sidebar>
  );
}
