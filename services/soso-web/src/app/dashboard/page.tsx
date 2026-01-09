"use client"
// src/app/dashboard/page.tsx

import RightSidebarView from "@/views/DashboardView/RightSidebarView/components/RightSidebarView"
export default function Page() {
    return (
      <RightSidebarView>
        <div className="p-8">
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
        </div>
      </RightSidebarView>
    )
}