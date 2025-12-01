// src/app/dashboard/page.tsx

import RightSidebarView from "@/components/dashboard-page/right-sidebar-view/right-sidebar-view"

export default function Page() {
    return (
      // ここには title や reason は不要です！
      <RightSidebarView>
          <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
      </RightSidebarView>
    )
}