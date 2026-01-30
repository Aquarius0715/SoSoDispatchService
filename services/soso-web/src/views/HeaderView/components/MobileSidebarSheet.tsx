// src/views/HeaderView/components/MobileSidebarSheet.tsx
"use client";

import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { CalendersSidebarBody } from "../../CalendersSidebarVIew/components/CalenderSidebarBody";
import { CalenderDetailSidebarView } from "@/views/CalenderDetailSidebarView/CalenderDetailSidebar/CalenderDetailSidebarView";

export type MobileSidebarSheetProps = {
  calenderId: string | null;
};

export function MobileSidebarSheet({ calenderId }: MobileSidebarSheetProps) {
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

        <div className="h-full border-r bg-background">
          {calenderId ? (
            <CalenderDetailSidebarView calenderId={calenderId} />
          ) : (
            <CalendersSidebarBody />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
