// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/components/SidebarTabFooter.tsx
"use client";

import React from "react";
import { Users, History } from "lucide-react";

import { SidebarFooter } from "@/components/ui/sidebar";
import { type SidebarTab } from "../schema";
import { SidebarTabButton } from "./SidebarTabButton";

type Props = {
  tab: SidebarTab;
  onTabChange: (next: SidebarTab) => void;
};

export function SidebarTabFooter({ tab, onTabChange }: Props) {
  return (
    <SidebarFooter className="p-2">
      <div className="grid grid-cols-2 gap-2">
        <SidebarTabButton
          label="メンバー一覧"
          tooltip="メンバー一覧"
          icon={Users}
          active={tab === "members"}
          onClick={() => onTabChange("members")}
        />
        <SidebarTabButton
          label="SOSoポイント履歴"
          tooltip="SOSoポイント履歴"
          icon={History}
          active={tab === "timeline"}
          onClick={() => onTabChange("timeline")}
        />
      </div>
    </SidebarFooter>
  );
}
