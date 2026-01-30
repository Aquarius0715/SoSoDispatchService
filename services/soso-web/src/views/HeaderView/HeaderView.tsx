// src/views/HeaderView/HeaderView.tsx
"use client";

import React from "react";
import { Menubar } from "@/components/ui/menubar";
import { cn } from "@/lib/utils";

import { MobileSidebarSheet } from "./components/MobileSidebarSheet";
import { HeaderCenterLogo } from "./components/HeaderCenterLogo";
import { HeaderAccountSection } from "./components/HeaderAccountSection";
import { useHeaderView } from "./useHeaderView";

export default function HeaderView() {
  const { calenderId } = useHeaderView();

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
          <MobileSidebarSheet calenderId={calenderId} />
        </div>

        {/* 中央：ロゴ（モバイルは中央寄せ、md以上は左寄せ） */}
        <HeaderCenterLogo />

        {/* 右：ユーザー（アイコンのみ。名前はmd以上でのみ） */}
        <HeaderAccountSection />
      </Menubar>
    </header>
  );
}
