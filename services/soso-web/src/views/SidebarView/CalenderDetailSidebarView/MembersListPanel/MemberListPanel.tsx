// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/members/MemberListPanel.tsx
"use client";

import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { useMemberListPanel } from "./useMemberListPanel";
import { MemberCard } from "./components/MemberCard";

type Props = {
  calenderId: string;
};

export function MemberListPanel({ calenderId }: Props) {
  const { members, error, isLoading } = useMemberListPanel(calenderId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">メンバー一覧の取得に失敗しました</div>
    );
  }

  if (members.length === 0) {
    return <div className="text-sm text-muted-foreground">メンバーがいません</div>;
  }

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <MemberCard key={m.id} member={m} />
      ))}
    </div>
  );
}
