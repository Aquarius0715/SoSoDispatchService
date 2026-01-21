// src/views/HeaderView/HeaderView.tsx
"use client";

import React from "react";
import { Menubar } from "@/components/ui/menubar";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./components/AccountMenu";
import { HeaderLogo } from "./components/HeaderLogo";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

import { CalendersSidebarBody } from "../CalendersSidebarVIew/components/CalenderSidebarBody";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";


export default function HeaderView() {
  return (
    <header className="w-full">
      <Menubar
        className={cn(
          "h-16 w-full rounded-none border border-border",
          "bg-muted/60",
          "px-3 md:px-6",
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
              <CalendersSidebarBody />
            </div>
          </SheetContent>

          </Sheet>
        </div>

        {/* 中央：ロゴ（モバイルは中央寄せ、md以上は左寄せ） */}
        <div className="flex-1 md:flex-none">
          <div className="relative flex w-full items-center justify-center md:justify-start">
            <div className="md:static md:translate-x-0">
              <HeaderLogo />
            </div>
          </div>
        </div>

        {/* 右：ユーザー（アイコンのみ。名前はmd以上でのみ） */}
        <div className="ml-auto flex items-center">
          <div className="md:hidden">
            <AccountMenu compact />
          </div>
          <div className="hidden md:block">
            <AccountMenu />
          </div>
        </div>
      </Menubar>
    </header>
  );
}
