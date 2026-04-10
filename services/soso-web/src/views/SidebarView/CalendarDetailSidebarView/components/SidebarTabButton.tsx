// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/components/SidebarTabButton.tsx
"use client";

import React from "react";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  label: string;
  tooltip: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
};

export function SidebarTabButton({
  label,
  tooltip,
  icon: Icon,
  active,
  onClick,
}: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? "outline" : "ghost"}
          className={cn("h-10 w-full")}
          onClick={onClick}
          aria-label={label}
        >
          <Icon className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
