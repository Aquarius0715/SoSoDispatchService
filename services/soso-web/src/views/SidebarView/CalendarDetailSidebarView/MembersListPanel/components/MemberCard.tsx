// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/members/components/MemberCard.tsx
"use client";

import React from "react";
import { Car, Users as UsersIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { type CalendarMember } from "../schema";

type Props = {
  member: CalendarMember;
};

export function MemberCard({ member }: Props) {
  const username = member.username || "（名前未設定）";

  return (
    <Card className="w-full">
      {/* 上下の余白を詰める: p-3 -> px-3 py-2（必要なら py-1.5 でもOK） */}
      <CardContent className="overflow-hidden px-3 py-0">
        <div className="flex w-full min-w-0 items-center gap-3 overflow-hidden">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback>
              {member.username?.slice(0, 1)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 w-0 flex-1 overflow-hidden">
            <div
              className="truncate text-base font-semibold leading-tight"
              title={username}
            >
              {username}
            </div>

            {/* 余白を詰める: mt-1 -> mt-0.5 */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground leading-none">
              <div className="inline-flex items-center gap-1">
                <Car className="h-3.5 w-3.5" />
                {member.hasCar ? "車あり" : "車なし"}
              </div>
              <div className="inline-flex items-center gap-1">
                <UsersIcon className="h-3.5 w-3.5" />
                {member.capacity}人
              </div>
            </div>

            {/* 余白を詰める: mt-2 -> mt-1 */}
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-[10px] leading-none text-muted-foreground">
                SOSo
              </div>
              <div className="text-sm font-semibold leading-none">
                {(member.sosoPoint ?? 0).toString()}pt
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
