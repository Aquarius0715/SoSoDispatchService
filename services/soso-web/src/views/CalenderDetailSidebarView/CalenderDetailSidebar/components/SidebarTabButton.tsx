// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/components/SidebarTabButton.tsx
"use client";

import React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  href: string;
  label: string;
  tooltip: string;
  icon: LucideIcon;
  active: boolean;
};

export function SidebarTabButton({
  href,
  label,
  tooltip,
  icon: Icon,
  active,
}: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant={active ? "outline" : "ghost"}
          className={cn("h-10 w-full")}
        >
          <Link href={href} aria-label={label}>
            <Icon className="h-5 w-5" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
