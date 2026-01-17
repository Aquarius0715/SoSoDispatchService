// app/calenders/layout.tsx
import type { ReactNode } from "react";
import HeaderView from "@/views/HeaderView/HeaderView";
import { RequireAuth } from "@/lib/auth/RequireAuth";
import CalendersSidebar from "@/views/CalendersSidebarVIew/CalendersSidebarView";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-dvh">
        <HeaderView />

        <div className="flex min-h-[calc(100dvh-64px)]">
          <aside className="w-72 shrink-0 border-r bg-white">
            <CalendersSidebar />
          </aside>

          <main className="min-w-0 flex-1 overflow-auto px-4 py-4 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
