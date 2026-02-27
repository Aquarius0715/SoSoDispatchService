// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/timeline/components/TimelineCard.tsx
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
    <Card className="w-full max-w-full">
      <CardContent className="p-3 overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="break-words text-sm font-medium">{eventLabel}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {changedAtText}
            </div>
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
