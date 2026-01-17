// src/app/page.tsx
"use client";

// レフトビューの表示確認用に一時的にコメントアウト
// import { handleRootRedirect } from "@/lib/server/rootRedirect";
import type { Member } from "@/views/DashboardView/LeftSidebarView/components/MemberCard";
import { Member_Sidebar } from "@/views/DashboardView/LeftSidebarView/components/Member_Sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
// export const dynamic = "force-dynamic"; // 毎回評価させる

export default function RootPage() {
  // 認証状態に応じて /login または /calenderList に飛ばす
  // await handleRootRedirect();

  // テスト用のメンバーデータ
  const members: Member[] = [
    {
      id: 1,
      name: "田中太郎",
      hasCar: true,
      carCapacity: 3,
      point: 5,
      isMe: true,
    },
    {
      id: 2,
      name: "佐藤花子",
      hasCar: false,
      carCapacity: 0,
      point: 12,
      isMe: false,
    },
    {
      id: 3,
      name: "鈴木一郎",
      hasCar: true,
      carCapacity: 5,
      point: 8,
      isMe: false,
    },
  ];

  return (
      <SidebarProvider>
      <Member_Sidebar members={members} />
      
      <SidebarInset>
        <main className="flex-1 rounded-xl bg-white p-4 shadow-sm">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold text-slate-800">ダッシュボード</h1>
          <p className="mt-4 text-slate-600">
            レフトビューの表示確認用ページです。レフトサイドバーが正しく表示されているか確認してください。
          </p>
        </main>
      </SidebarInset>
      </SidebarProvider>
  );
}
