// src/app/dashboard/layout.tsx (または適切な階層のlayout.tsx)
"use client";
import "./globals.css";


import type { Member } from "@/views/DashboardView/LeftSidebarView/components/MemberCard";
import { MemberSidebar } from "@/views/DashboardView/LeftSidebarView/components/MemberSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children, // ← ★これが page.tsx の中身になります
}: {
  children: React.ReactNode;
}) {
  // ※本来はここもDBやAPIから取得しますが、一旦モックデータのままでOK
  const members: Member[] = [
    { id: 1, name: "田中太郎", hasCar: true, carCapacity: 3, point: 5, isMe: true },
    { id: 2, name: "佐藤花子", hasCar: false, carCapacity: 0, point: 12, isMe: false },
    { id: 3, name: "鈴木一郎", hasCar: true, carCapacity: 5, point: 8, isMe: false },
  ];

  return (
    <html lang="ja">
      <body>
        <SidebarProvider>
          <div className="flex h-screen w-full overflow-hidden bg-slate-50">
            
            {/* 左カラム：サイドバー (全ページ共通) */}
            <MemberSidebar members={members} />

            {/* 右カラム：メインエリア */}
            <div className="flex flex-1 flex-col min-w-0">
              
              {/* ヘッダー (全ページ共通) */}
              <header className="flex h-16 shrink-0 items-center border-b bg-white px-4 shadow-sm z-10 relative">
                <SidebarTrigger className="-ml-2 mr-2" />
                <div className="h-6 w-px bg-slate-200 mr-4" />
                <h1 className="text-lg font-semibold text-slate-800">ダッシュボード</h1>
              </header>

              {/* コンテンツ部分 */}
              {/* ここに page.tsx の中身が注入されます */}
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
              
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}