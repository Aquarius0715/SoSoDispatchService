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
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {member.username?.slice(0, 1)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold">
              {member.username || "（名前未設定）"}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <div className="inline-flex items-center gap-1">
                <Car className="h-3.5 w-3.5" />
                {member.hasCar ? "車あり" : "車なし"}
              </div>
              <div className="inline-flex items-center gap-1">
                <UsersIcon className="h-3.5 w-3.5" />
                {member.capacity}人
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] leading-none text-muted-foreground">
              SOSo
            </div>
            <div className="text-sm font-semibold">{member.sosoPoint}pt</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
