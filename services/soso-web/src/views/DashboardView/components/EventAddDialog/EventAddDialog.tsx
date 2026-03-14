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
import { Form } from "@/components/ui/form";
import { CalendarIcon, Loader2 } from "lucide-react";

import { EventFormInputs } from "./components/EventFormInputs";
// ★ ここでHookをインポート
import { useEventAddDialog } from "./useEventAddDialog";

interface EventAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  calendarId: string;
  onSuccess: () => void;
}

const EventAddDialog: React.FC<EventAddDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  calendarId,
  onSuccess
}) => {
  // ★ フックを使用: ロジックは全てここに隠蔽された
  const { form, onSubmit, isSubmitting } = useEventAddDialog({
    calendarId,
    selectedDate,
    onSuccess,
    onClose
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] !flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="shrink-0 px-6 py-4 border-b bg-white">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            予定を追加 ({selectedDate})
          </DialogTitle>
        </DialogHeader>

        {/* Form Context でラップ */}
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Scrollable Inputs Area */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="px-6 py-6">
                <EventFormInputs control={form.control} />
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="shrink-0 px-6 py-4 border-t bg-gray-50">
              <Button variant="outline" type="button" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "保存中..." : "保存する"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventAddDialog;