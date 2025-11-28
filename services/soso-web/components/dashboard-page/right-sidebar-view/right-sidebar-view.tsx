'use client'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard-page/right-sidebar-view/app-sidebar"
import Modal from "./modal"
import { useState } from "react"

export default function RightSidebarView({ children }: { children: React.ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    setIsModalOpen(true);

  return (
    <>
    <SidebarProvider className="flex-row-reverse">
      <AppSidebar />
      <main>
        <SidebarTrigger/>
        {children}
      </main>
    </SidebarProvider>
    {isModalOpen && <Modal />}
    </>
  )
}