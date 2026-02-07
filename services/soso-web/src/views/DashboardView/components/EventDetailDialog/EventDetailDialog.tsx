// src/views/DashboardView/components/EventDetailDialog/EventDetailDialog.tsx
'use client';

import React from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, Clock, MapPin, Users, Car, Share2, Edit, ExternalLink, Loader2 
} from "lucide-react";

import { useEventDetailDialog, type EventData } from './useEventDetailDialog';

interface EventDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: EventData; // FullCalendarから渡されるイベント情報
  onEventUpdated: () => void; // 参加登録などで更新があった場合
}

export const EventDetailDialog: React.FC<EventDetailDialogProps> = ({
  isOpen,
  onClose,
  eventData,
  onEventUpdated
}) => {
  // Hookを使用
  const {
    isRegistering,
    userDropOffRegistered,
    userPickUpRegistered,
    handleRegister,
    displayData
  } = useEventDetailDialog({ eventData, onClose, onSuccess: onEventUpdated });

  // 日付フォーマット関数
  const fmtJstDate = (date: Date) => 
    date ? date.toLocaleDateString('ja-JP', {
      timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
    }) : '--';

  const fmtJstTime = (date: Date) => 
    date ? date.toLocaleTimeString('ja-JP', {
      timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false
    }) : '--';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden bg-white">
        
        {/* ヘッダー */}
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold leading-tight">
                {displayData.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {fmtJstDate(displayData.date)}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 h-8 gap-1">
              <Edit className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">編集</span>
            </Button>
          </div>
        </DialogHeader>

        {/* スクロールエリア */}
        <ScrollArea className="max-h-[60vh] overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* 共有ボタン */}
            <Button variant="outline" className="w-full gap-2" size="sm">
              <Share2 className="h-4 w-4" />
              イベントを共有する
            </Button>

            <Separator />

            {/* 時間と詳細 */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {fmtJstTime(displayData.startTime)} 〜 {fmtJstTime(displayData.endTime)}
                </span>
              </div>
              <div className="bg-muted/50 p-3 rounded-md text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {displayData.description || "詳細情報はありません"}
              </div>
            </div>

            {/* 配車状況カード */}
            <div className="grid grid-cols-2 gap-4">
              {/* 送り (帰り) */}
              <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="p-4 space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Car className="h-3 w-3" /> 送り (帰り)
                  </div>
                  <div className="text-2xl font-bold">
                    {displayData.dropOffRemaining} 
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      / {displayData.seatsReturnTotal}席
                    </span>
                  </div>
                  <Badge variant={displayData.dropOffRemaining === 0 ? "destructive" : "outline"} className="text-[10px] px-1 h-5">
                    {displayData.dropOffRemaining === 0 ? "満席" : "募集中"}
                  </Badge>
                </CardContent>
              </Card>

              {/* 迎え (行き) */}
              <Card className="border-l-4 border-l-green-500 shadow-sm">
                <CardContent className="p-4 space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Car className="h-3 w-3" /> 迎え (行き)
                  </div>
                  <div className="text-2xl font-bold">
                    {displayData.pickUpRemaining} 
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                        / {displayData.seatsGoTotal}席
                    </span>
                  </div>
                  <Badge variant={displayData.pickUpRemaining === 0 ? "destructive" : "outline"} className="text-[10px] px-1 h-5">
                    {displayData.pickUpRemaining === 0 ? "満席" : "募集中"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* 参加者 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Users className="h-4 w-4" />
                参加者
              </div>
              <div className="flex flex-wrap gap-2">
                {displayData.participants.length > 0 ? (
                  displayData.participants.map((p, i) => (
                    <Badge key={i} variant="secondary" className="font-normal">
                      {p}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">参加者はいません</span>
                )}
              </div>
            </div>

            {/* 会場情報 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <MapPin className="h-4 w-4" />
                ルート・会場
              </div>
              <div className="text-sm pl-6 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{displayData.origin || "未設定"}</span>
                </div>
                <div className="border-l border-dashed border-gray-300 h-3 ml-[2.5px]" />
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>{displayData.destination || "未設定"}</span>
                </div>
              </div>
              {displayData.url && (
                <a 
                  href={displayData.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 pl-6 mt-1"
                >
                  会場URLを開く <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

          </div>
        </ScrollArea>

        {/* フッターアクション */}
        <DialogFooter className="p-4 border-t bg-gray-50/50">
          <div className="flex gap-3 w-full">
            <Button
              className={`flex-1 ${userDropOffRegistered ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
              variant={userDropOffRegistered ? "default" : "outline"}
              onClick={() => handleRegister('dropOff')}
              disabled={isRegistering || userDropOffRegistered || displayData.dropOffRemaining === 0}
            >
              {isRegistering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {userDropOffRegistered ? '送り登録済み' : '送りに登録'}
            </Button>

            <Button
              className={`flex-1 ${userPickUpRegistered ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
              variant={userPickUpRegistered ? "default" : "outline"}
              onClick={() => handleRegister('pickUp')}
              disabled={isRegistering || userPickUpRegistered || displayData.pickUpRemaining === 0}
            >
              {isRegistering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {userPickUpRegistered ? '迎え登録済み' : '迎えに登録'}
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};