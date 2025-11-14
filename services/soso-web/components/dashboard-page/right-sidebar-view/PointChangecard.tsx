"use client"

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

type PointChangeCardProps = {
    title: string
    dateTime: string
    changer: string
    changee: string
    pointText: string
    pointTextColor: string
    reason: string
    className?: string
}

export function PointChangeCard({
    title,
    dateTime,
    changer,
    changee,
    pointText,
    pointTextColor,
    reason,
    className,
  }: PointChangeCardProps): React.ReactElement {
    return (
      <Card className={cn("bg-gray-50 shadow-sm p-0 gap-0", className)}>
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
  
  // 使用例（参考：実際のコードでは削除/コメントアウトしてください）
  // <PointChangeCard
  //   title="新歓コンパ"
  //   dateTime="2024/04/15 22:00"
  //   changer="佐藤花子"
  //   changee="田中太郎"
  //   pointText="-1pt"
  //   pointTextColor="text-red-600"
  //   reason="みんなの分のタクシーを手配してくれた"
  // />