// src/views/HeaderView/components/MobileSidebarSheet.tsx
"use client";

import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { CalendarsSidebar } from "../../SidebarView/CalendarListSidebarView/components/CalendarSidebar";
import { CalendarDetailSidebar } from "@/views/SidebarView/CalendarDetailSidebarView/CalendarDetailSidebar";

export type MobileSidebarSheetProps = {
  calendarId: string | null;
};

export function MobileSidebarSheet({ calendarId }: MobileSidebarSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0 [&>button]:hidden">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>カレンダーメニュー</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        <div className="h-full bg-sidebar text-sidebar-foreground">
          {calendarId ? (
            <CalendarDetailSidebar calendarId={calendarId} />
          ) : (
            <CalendarsSidebar />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
