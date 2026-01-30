// src/views/HeaderView/HeaderView.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menubar } from "@/components/ui/menubar";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./components/AccountMenu";
import { HeaderLogo } from "./components/HeaderLogo";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

import { CalendersSidebar } from "../SidebarView/CalenderListSidebarView/components/CalenderSidebar";
import { CalenderDetailSidebar } from "../SidebarView/CalenderDetailSidebarView/CalenderDetailSidebar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

function getCalenderIdFromPathname(pathname: string): string | null {
  // pathname examples:
  // - /calenders
  // - /calenders/<uuid>
  // - /calenders/<uuid>/events
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "calenders") return null;

  const id = parts[1];
  if (!id) return null;

  return UUID_RE.test(id) ? id : null;
}

export default function HeaderView() {
  const pathname = usePathname();
  const calenderId = getCalenderIdFromPathname(pathname);

  return (
    <header className="w-full">
      <Menubar
        className={cn(
          "h-16 w-full rounded-none border border-border",
          "bg-muted/60",
          "px-3 lg:px-6",
          "flex items-center"
        )}
      >
        {/* 左：モバイルだけハンバーガー */}
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
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
                  <CalenderDetailSidebar calenderId={calenderId} />
                ) : (
                  <CalendersSidebar />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* 中央：ロゴ（モバイルは中央寄せ、lg以上は左寄せ） */}
        <div className="flex-1 lg:flex-none">
          <div className="relative flex w-full items-center justify-center lg:justify-start">
            <div className="lg:static lg:translate-x-0">
              <HeaderLogo />
            </div>
          </div>
        </div>

        {/* 右：ユーザー（アイコンのみ。名前はlg以上でのみ） */}
        <div className="ml-auto flex items-center">
          <div className="lg:hidden">
            <AccountMenu compact />
          </div>
          <div className="hidden lg:block">
            <AccountMenu />
          </div>
        </div>
      </Menubar>
    </header>
  );
}
