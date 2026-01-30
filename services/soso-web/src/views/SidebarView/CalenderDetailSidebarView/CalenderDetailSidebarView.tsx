// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/CalenderDetailSidebarView.tsx
"use client";

import React from "react";

import { Sidebar } from "@/components/ui/sidebar";

import { CalenderDetailSidebar } from "./CalenderDetailSidebar";

type Props = {
  calenderId: string;
};

/**
 * /calenders/[id] 専用サイドバー（デスクトップ表示）
 * - モバイルは Header の Sheet から開くため、ここは md 以上のみ表示
 */
export function CalenderDetailSidebarView({ calenderId }: Props) {
  return (
    <Sidebar collapsible="none" className="hidden h-full border-r md:flex">
      <CalenderDetailSidebar calenderId={calenderId} />
    </Sidebar>
  );
}
