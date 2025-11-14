'use clinent'
import { AppSidebar } from "@/components/dashboard-page/right-sidebar-view/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Page() {
    return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        {/* メインコンテンツ領域 */}
        <SidebarInset className="flex-1">
          <main className="p-6">
            {/*<h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>*/}
            {/* ここにメインコンテンツを配置 */}
          </main>
        </SidebarInset>

        {/* 右サイドバー */}
        <AppSidebar />
      </div>
    </SidebarProvider>

    )
}