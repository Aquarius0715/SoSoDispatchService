"use client"

import * as React from "react"
import { Sidebar, SidebarHeader, SidebarContent } from "@/components/ui/sidebar"
import { PointChangeCard } from "@/components/dashboard-page/right-sidebar-view/PointChangecard"
import { Button } from "@/components/ui/button"

type PointChange = {
  // id: string
  title: string
  dateTime: string
  changer: string
  changee: string
  pointText: string
  pointTextColor: string
  reason: string
}

export function AppSidebar(): React.ReactElement {
  const pointChanges: PointChange[] = [
    {
      title: "新歓コンパ",
      dateTime: "2024/04/15 22:00",
      changer: "佐藤花子",
      changee: "田中太郎",
      pointText: "-1pt",
      pointTextColor: "text-red-600",
      reason: "みんなの分のタクシーを手配してくれた"
    },
    {
      title: "新歓コンパ",
      dateTime: "2024/04/15 21:15",
      changer: "山田次郎",
      changee: "鈴木三郎",
      pointText: "+2pt",
      pointTextColor: "text-blue-600",
      reason: "カラオケで大声で歌いすぎた"
    },
    {
      title: "新歓コンパ",
      dateTime: "2024/04/15 20:30",
      changer: "田中太郎",
      changee: "佐藤花子",
      pointText: "+3pt",
      pointTextColor: "text-red-600",
      reason: "お酒をこぼして服を汚した"
    },
    {
      title: "歓送迎会",
      dateTime: "2024/04/10 23:45",
      changer: "鈴木三郎",
      changee: "山田次郎",
      pointText: "+1pt",
      pointTextColor: "text-purple-600",
      reason: "二次会で遅に送って遅刻させた"
    }
  ]

  return (
    <Sidebar side="right">
      <SidebarHeader className="flex flex-row items-center justify-between mt-2 mb-2 gap-2 bg-gray-400">
        <Button variant="outline">カレンダー共有</Button>
        <Button variant="outline">ログアウト</Button>
      </SidebarHeader>
      
      <SidebarContent className="p-4 space-y-4">
        {pointChanges.map((change, index) => (
          <PointChangeCard
            key={index}
            title={change.title}
            dateTime={change.dateTime}
            changer={change.changer}
            changee={change.changee}
            pointText={change.pointText}
            pointTextColor={change.pointTextColor}
            reason={change.reason}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  )
}