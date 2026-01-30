// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/components/SidebarMainCard.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SidebarMainCard({ title, description, children }: Props) {
  return (
    <Card className="flex h-full flex-col gap-0 py-0">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 px-0">
        <ScrollArea className="h-full">
          <div className="px-4 pb-4">{children}</div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
