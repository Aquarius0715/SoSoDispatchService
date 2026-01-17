// app/calenders/layout.tsx
import type { ReactNode } from "react";
import HeaderView from "@/views/HeaderView/HeaderView";
import { RequireAuth } from "@/lib/auth/RequireAuth";
import CalendersSidebarView from "@/views/CalendersSidebarView/CalendersSidebarView";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="h-dvh overflow-hidden">
        <div className="flex h-full flex-col">
          <HeaderView />
          <SidebarProvider>
            <div className="flex flex-1 overflow-hidden">
              <CalendersSidebarView />
              <main className="min-w-0 flex-1 overflow-auto px-4 py-4 md:px-6">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </RequireAuth>
  );
}
