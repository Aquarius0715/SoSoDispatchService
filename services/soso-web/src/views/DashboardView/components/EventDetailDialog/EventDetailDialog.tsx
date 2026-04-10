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

import { useEventDetailDialog } from './useEventDetailDialog';
import { fmtJstDate, fmtJstTime } from '@/lib/dateUtils';

interface EventDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onEventUpdated: () => void;
}

export const EventDetailDialog: React.FC<EventDetailDialogProps> = ({
  isOpen,
  onClose,
  eventId,
  onEventUpdated
}) => {
  const {
    isMeDriver,
    eventData,
    isLoading,
    isActionLoading,
    handleRegisterDriver
  } = useEventDetailDialog({ eventId, isOpen, onEventUpdated });

  // 表示用データはすべて詳細APIの eventData のみ（ローディング中は未取得）
  const display = eventData ? {
    title: eventData.title,
    date: new Date(eventData.startTime),
    startTime: new Date(eventData.startTime),
    endTime: new Date(eventData.endTime),
    description: eventData.description,
    origin: eventData.originLocation,
    destination: eventData.destinationLocation,
    remainingGo: eventData.remainingGoSeats,
    remainingReturn: eventData.remainingReturnSeats,
    totalGo: eventData.seatsRequiredGo,
    totalReturn: eventData.seatsRequiredReturn,
    participants: eventData.participants ?? [],
  } : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden bg-white">
        
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold leading-tight">
                {display ? display.title : 'イベント詳細'}
              </DialogTitle>
              {display && (
                <DialogDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {fmtJstDate(display.date)}
                </DialogDescription>
              )}
            </div>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            {!display ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                読み込み中...
              </div>
            ) : (
              <>
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <Share2 className="h-4 w-4" />
                  イベントを共有する
                </Button>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {fmtJstTime(display.startTime)} 〜 {fmtJstTime(display.endTime)}
                    </span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {display.description || "詳細情報はありません"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-4 space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Car className="h-3 w-3" /> 送り (帰り)
                      </div>
                      <div className="text-2xl font-bold">
                        {display.remainingReturn}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          / {display.totalReturn}席
                        </span>
                      </div>
                      <Badge variant={display.remainingReturn === 0 ? "destructive" : "outline"} className="text-[10px] px-1 h-5">
                        {display.remainingReturn === 0 ? "満席" : "募集中"}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardContent className="p-4 space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Car className="h-3 w-3" /> 迎え (行き)
                      </div>
                      <div className="text-2xl font-bold">
                        {display.remainingGo}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          / {display.totalGo}席
                        </span>
                      </div>
                      <Badge variant={display.remainingGo === 0 ? "destructive" : "outline"} className="text-[10px] px-1 h-5">
                        {display.remainingGo === 0 ? "満席" : "募集中"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Users className="h-4 w-4" />
                    参加者
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {display.participants.length > 0 ? (
                      display.participants.map((p, i) => (
                        <Badge key={i} variant="secondary" className="font-normal">
                          {p}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">参加者はいません</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <MapPin className="h-4 w-4" />
                    ルート・会場
                  </div>
                  <div className="text-sm pl-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{display.origin || "未設定"}</span>
                    </div>
                    <div className="border-l border-dashed border-gray-300 h-3 ml-[2.5px]" />
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>{display.destination || "未設定"}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-gray-50/50">
          <div className="flex gap-3 w-full">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => handleRegisterDriver('pickup')}
              disabled={!display || isMeDriver || isActionLoading || display.remainingGo === 0}
            >
              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              迎え(行き)に登録
            </Button>

            <Button
              className="flex-1"
              variant="outline"
              onClick={() => handleRegisterDriver('return')}
              disabled={!display || isActionLoading || display.remainingReturn === 0}
            >
              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              送り(帰り)に登録
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};