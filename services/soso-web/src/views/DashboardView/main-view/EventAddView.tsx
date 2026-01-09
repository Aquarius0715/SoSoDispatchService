'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, MapPin, Users, Clock } from "lucide-react";

// Hookの返り値の型に合わせてPropsを定義
interface EventAddViewProps {
  isOpen: boolean;
  onClose: () => void;
  // Hookから返されるオブジェクトを受け取る
  formState: any; // 厳密に型付けするならHookの返り値型定義推奨
  toggleParticipant: (id: number) => void;
  handleSubmit: () => void;
}

const EventAddView: React.FC<EventAddViewProps> = ({
  isOpen,
  onClose,
  formState,
  toggleParticipant,
  handleSubmit,
}) => {
  const {
    date,
    title, setTitle,
    details, setDetails,
    dropOffTime, setDropOffTime,
    pickUpTime, setPickUpTime,
    dropOffCount, setDropOffCount,
    pickUpCount, setPickUpCount,
    departurePoint, setDeparturePoint,
    destinationPoint, setDestinationPoint,
    participants
  } = formState;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            予定を追加 ({date})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="grid gap-4 py-4 px-1">
            
            {/* タイトル */}
            <div className="grid gap-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="イベント名を入力"
              />
            </div>

            {/* 詳細 */}
            <div className="grid gap-2">
              <Label htmlFor="details">詳細</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="詳細情報を入力"
                className="resize-none"
              />
            </div>

            {/* 時間設定 (2カラム) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dropOffTime" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 送り時刻
                </Label>
                <Input
                  id="dropOffTime"
                  type="time"
                  value={dropOffTime}
                  onChange={(e) => setDropOffTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pickUpTime" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 迎え時刻
                </Label>
                <Input
                  id="pickUpTime"
                  type="time"
                  value={pickUpTime}
                  onChange={(e) => setPickUpTime(e.target.value)}
                />
              </div>
            </div>

            {/* 人数設定 (2カラム) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dropOffCount">送り人数</Label>
                <Input
                  id="dropOffCount"
                  type="number"
                  min={0}
                  value={dropOffCount === 0 ? '' : dropOffCount}
                  onChange={(e) => setDropOffCount(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pickUpCount">迎え人数</Label>
                <Input
                  id="pickUpCount"
                  type="number"
                  min={0}
                  value={pickUpCount === 0 ? '' : pickUpCount}
                  onChange={(e) => setPickUpCount(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* 場所設定 (2カラム) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="departure" className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> 出発地
                </Label>
                <Input
                  id="departure"
                  value={departurePoint}
                  onChange={(e) => setDeparturePoint(e.target.value)}
                  placeholder="例: 大学"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination" className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> 目的地
                </Label>
                <Input
                  id="destination"
                  value={destinationPoint}
                  onChange={(e) => setDestinationPoint(e.target.value)}
                  placeholder="例: 会場"
                />
              </div>
            </div>

            {/* 参加者リスト */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> 参加者候補
              </Label>
              <div className="border rounded-md p-4 space-y-3 bg-gray-50/50">
                {participants.length > 0 ? participants.map((p: any) => (
                  <div key={p.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`p-${p.id}`} 
                      checked={p.isChecked}
                      onCheckedChange={() => toggleParticipant(p.id)}
                    />
                    <label
                      htmlFor={`p-${p.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {p.name}
                    </label>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground">メンバーがいません</div>
                )}
              </div>
            </div>

          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={() => {
            handleSubmit();
            onClose();
          }}>保存する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventAddView;