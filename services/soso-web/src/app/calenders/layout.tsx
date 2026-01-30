// app/calenders/layout.tsx
import type { ReactNode } from "react";

import { RequireAuth } from "@/lib/auth/RequireAuth";
import HeaderView from "@/views/HeaderView/HeaderView";
import CalendersSidebarSwitch from "@/views/CalendersSidebarVIew/CalendersSidebarSwitch";
import { SidebarProvider } from "@/components/ui/sidebar";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <RequireAuth>
      <div className="flex h-dvh w-full flex-col overflow-hidden">
        {/* Header (常に一番上) */}
        <div className="shrink-0 border-b bg-background">
          <HeaderView />
        </div>

        {/* Header の下に Sidebar + Main */}
        <SidebarProvider className="min-h-0 flex-1 overflow-hidden">
          <CalendersSidebarSwitch />

          <main className="min-w-0 flex-1 overflow-auto px-4 py-4 md:px-6">
            {children}
          </main>
        </SidebarProvider>
      </div>
    </RequireAuth>
  );
}
