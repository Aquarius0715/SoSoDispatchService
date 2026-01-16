"use client"
import React from 'react';
import { useModal } from '../useModal';
import { ModalProps } from "@/types/rightsidebar";

// shadcnのDialogコンポーネントをインポート
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Modal({ onClose, title, reason }: ModalProps) {
  // カスタムフックの使用
  const { handleOpenChange } = useModal(onClose);

  return (
    // open={true} で強制的に開き、onOpenChange で閉じる動作を検知します
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
            <p className="text-xs text-gray-500 font-bold mb-1">理由詳細</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {reason}
            </p>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            閉じる
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}