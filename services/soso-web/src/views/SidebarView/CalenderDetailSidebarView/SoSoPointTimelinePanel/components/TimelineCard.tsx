// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/timeline/components/TimelineCard.tsx
"use client";

import React from "react";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  eventLabel: string;
  changedAtText: string;
  changerName: string;
  targetName: string;
  deltaText: string;
  reasonText: string;
};

export function TimelineCard({
  eventLabel,
  changedAtText,
  changerName,
  targetName,
  deltaText,
  reasonText,
}: Props) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 truncate text-sm font-medium">
            {eventLabel}
          </div>
          <div className="shrink-0 text-xs text-muted-foreground">
            {changedAtText}
          </div>
        </div>

        <div className="mt-2 text-sm leading-relaxed">
          <span className="font-medium">{changerName}</span> が{" "}
          <span className="font-medium">{targetName}</span> のSOSoポイントを{" "}
          <span className="font-medium">{deltaText}</span> 変更
        </div>

        <div className="mt-1 text-xs text-muted-foreground">理由：{reasonText}</div>
      </CardContent>
    </Card>
  );
}
