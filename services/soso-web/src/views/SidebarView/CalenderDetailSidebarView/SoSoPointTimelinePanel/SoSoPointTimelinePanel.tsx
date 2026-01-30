// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/timeline/SosoPointTimelinePanel.tsx
"use client";

import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { useSoSoPointTimelinePanel } from "./useSoSoPointTimelinePanel";
import { TimelineCard } from "./components/TimelineCard";

type Props = {
  calenderId: string;
};

function formatChangedAt(value: string) {
  try {
    return new Date(value).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function formatEventLabel(eventId?: string) {
  if (!eventId) return "イベント（不明）";
  const short = eventId.length > 10 ? `${eventId.slice(0, 10)}…` : eventId;
  return `イベント: ${short}`;
}

export function SoSoPointTimelinePanel({ calenderId }: Props) {
  const { members, histories, isLoading, error } = useSoSoPointTimelinePanel(
    calenderId
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        SOSoポイント履歴の取得に失敗しました
      </div>
    );
  }

  if (histories.length === 0) {
    return <div className="text-sm text-muted-foreground">履歴がまだありません</div>;
  }

  const nameMap = new Map(members.map((m) => [m.id, m.username]));

  const sorted = [...histories].sort((a, b) => {
    const at = Date.parse(a.changedAt);
    const bt = Date.parse(b.changedAt);
    return (Number.isNaN(bt) ? 0 : bt) - (Number.isNaN(at) ? 0 : at);
  });

  return (
    <div className="space-y-2">
      {sorted.map((h) => {
        const changerName = h.changedBy
          ? nameMap.get(h.changedBy) ?? "不明"
          : "システム";
        const targetName = nameMap.get(h.userId) ?? "不明";

        const delta =
          typeof h.pointDelta === "number" ? h.pointDelta : h.newPoint - h.oldPoint;
        const deltaText = `${delta > 0 ? "+" : ""}${delta}pt`;
        const reasonText = h.reason?.trim() ? h.reason : "—";

        return (
          <TimelineCard
            key={h.id}
            eventLabel={formatEventLabel(h.eventId)}
            changedAtText={formatChangedAt(h.changedAt)}
            changerName={changerName}
            targetName={targetName}
            deltaText={deltaText}
            reasonText={reasonText}
          />
        );
      })}
    </div>
  );
}
