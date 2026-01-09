'use client'
// services/soso-web/components/dashboard-page/right-sidebar-view/right-sidebar-view.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import Modal from "./Modal"
import { useState } from "react"
import { PointChangeCardProps } from "@/types/rightsidebar"

export default function RightSidebarView({ children }: { children: React.ReactNode }) {
  const [selectedCardData, setSelectedCardData] = useState<PointChangeCardProps | null>(null);
  // useStateは、「①現在の値(null)」 と 「②値を更新するための関数」 の2つが入った配列を返す．左辺は分割代入
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 子コンポーネント(AppSidebar)に渡す関数
  // データを受け取ってモーダルを開く処理
  const handleCardClick = (data: PointChangeCardProps) => { // 型定義されたdataを受け取る
    setSelectedCardData(data); // 受け取ったデータをselectedCardDataに代入
    setIsModalOpen(true); // isModalOpenをtrueに変更
  };

  return (
    <SidebarProvider className="flex-row-reverse">
      {/* バケツリレー：関数をPropsとして渡す */}
      <AppSidebar onCardClick={handleCardClick} />
      
      <main>
        <SidebarTrigger/>
        {children}
      </main>

      {/* モーダル表示制御はここ（親）で行う */}
      {isModalOpen && selectedCardData && (
        <Modal 
          title={selectedCardData.title}
          reason={selectedCardData.reason}
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </SidebarProvider>
  )
}
