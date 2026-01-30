// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/components/SidebarTabFooter.tsx
"use client";

import React from "react";
import { Users, History } from "lucide-react";

import { SidebarFooter } from "@/components/ui/sidebar";
import { type SidebarTab } from "../schema";
import { SidebarTabButton } from "./SidebarTabButton";

type Props = {
  tab: SidebarTab;
  makeHref: (next: SidebarTab) => string;
};

export function SidebarTabFooter({ tab, makeHref }: Props) {
  return (
    <SidebarFooter className="p-2">
      <div className="grid grid-cols-2 gap-2">
        <SidebarTabButton
          href={makeHref("members")}
          label="メンバー一覧"
          tooltip="メンバー一覧"
          icon={Users}
          active={tab === "members"}
        />
        <SidebarTabButton
          href={makeHref("timeline")}
          label="SOSoポイント履歴"
          tooltip="SOSoポイント履歴"
          icon={History}
          active={tab === "timeline"}
        />
      </div>
    </SidebarFooter>
  );
}
