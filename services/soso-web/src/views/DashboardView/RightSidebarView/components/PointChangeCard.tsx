"use client"
// services/soso-web/components/dashboard-page/right-sidebar-view/PointChangeCard.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { PointChangeCardProps } from "@/types/rightsidebar"

export function PointChangeCard({
    pointChangeData: {
      title,
      dateTime,
      changer,
      changee,
      pointText,
      pointTextColor,
      reason,
    },
    className,
    onClick, // 受け取る
  }: PointChangeCardProps): React.ReactElement {
    return (
      <Card 
        className={cn("bg-gray-50 shadow-sm p-0 gap-0", className)}
        onClick={onClick} // ここでセット
      >
        <CardHeader className="px-3 pt-3 pb-1 gap-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">
              {title}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              {dateTime}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-3 pb-1">
          <p className="text-sm font-semibold text-gray-800">
            {changer}が{changee}のSOSOポイントを{' '}
            <span className={pointTextColor}>{pointText}</span> 変更
          </p>
        </CardContent>
        
        <CardFooter className="px-3 pb-3 pt-0">
          <p className="text-xs text-gray-600">理由: {reason}</p>
        </CardFooter>
      </Card>
    );
  }
