'use client'
// services/soso-web/components/dashboard-page/right-sidebar-view/right-sidebar-view.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import Modal from "./Modal"
import { useState } from "react"
import { PointChangeData } from "@/types/rightsidebar"

export default function RightSidebarView({ children }: { children: React.ReactNode }) {
  // 選択されたカードのデータを保持する
  // null = 何も選択されてない = モーダルが閉じている
  // データあり = そのデータでモーダルが開いている状態
  const [selectedCardData, setSelectedCardData] = useState<PointChangeData | null>(null);
 

  // イベントハンドラ（開く処理）
  // handleCardClick関数はAppSidebarで実行される
  const handleCardClick = (data: PointChangeData) => { // 型定義されたdataを受け取る
    setSelectedCardData(data); // 受け取ったデータをselectedCardDataに代入
  };

  // 背景クリック，，閉じる処理のとき
  // nullに戻してモーダルを非表示にする
  const handleCloseModal = () =>  {
    setSelectedCardData(null);
  }
 

  return (
    <SidebarProvider className="flex-row-reverse">
      {/* バケツリレー：関数をPropsとして渡す，コールバック関数の受け渡し */}
      <AppSidebar onCardClick={handleCardClick} />
      
      <main>
        <SidebarTrigger/>
        {children}
      </main>

      {/* モーダル表示制御はここ（親）で行う */}
      {selectedCardData && (
        <Modal 
          title={selectedCardData.title}
          reason={selectedCardData.reason}
          onClose={handleCloseModal} 
        />
      )}
    </SidebarProvider>
  )
}
