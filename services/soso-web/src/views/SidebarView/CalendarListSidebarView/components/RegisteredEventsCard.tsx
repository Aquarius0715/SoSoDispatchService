"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RegisteredEventsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">配車登録済みイベント</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-500">
        （後回し）
      </CardContent>
    </Card>
  );
}
