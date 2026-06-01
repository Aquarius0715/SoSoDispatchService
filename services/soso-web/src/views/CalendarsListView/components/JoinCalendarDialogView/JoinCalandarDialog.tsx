"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useJoinCalendarDialog } from "./useJoinCalendarDialog";

type Props = {
  open: boolean;
  calenderId: string | null;
  onClose: () => void;
  onJoined: () => Promise<void>; // 一覧をリロードしたいので Promise に
};

export function JoinCalendarDialog({ open, calenderId, onClose, onJoined }: Props) {
  const { calendar, isLoading, isJoining, hasLoadError, onJoin, onBack } =
    useJoinCalendarDialog({
      open,
      calenderId,
      onClose,
      onJoined,
    });

  const title = calendar?.name ?? "カレンダー";
  const description = calendar?.description?.trim()
    ? calendar.description
    : "説明はありません";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-1">
          <DialogTitle>カレンダー参加</DialogTitle>
          <DialogDescription>このカレンダーに参加しますか？</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 pt-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-sm font-medium">{title}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
          )}

          {hasLoadError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              カレンダー情報の取得に失敗しました
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={isJoining}>
              戻る
            </Button>

            <Button
              type="button"
              onClick={onJoin}
              disabled={isJoining || !calenderId || isLoading}
            >
              {isJoining ? "参加中..." : "参加"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}