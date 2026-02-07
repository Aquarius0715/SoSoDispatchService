'use client';

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

import { eventAddSchema, type EventAddValues } from "./schema";
import { EventFormInputs } from "./components/EventFormInputs";

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
  const form = useForm<EventAddValues>({
    resolver: zodResolver(eventAddSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      dropOffTime: "09:00",
      pickUpTime: "17:00",
      dropOffCount: 0,
      pickUpCount: 0,
      originLocation: "",
      destinationLocation: "",
      participantUserIds: [],
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      console.log("Submit Data:", values);
      // ここに await APICall() が入る想定
      onSuccess();
      onClose();
      form.reset();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* レイアウト: !flex で DialogContent のデフォルト grid を上書き
        max-h-[90vh]: 画面高さの90%を上限に
        overflow-hidden: はみ出しを防ぎ、中だけスクロールさせる
      */}
      <DialogContent className="sm:max-w-lg max-h-[90vh] !flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header: 常に上に固定 */}
        <DialogHeader className="shrink-0 px-6 py-4 border-b bg-white">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            予定を追加 ({selectedDate})
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          {/* フォーム本体: flex-1 + min-h-0 で残り領域を取り、はみ出さないようにする */}
          <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* フォーム入力エリアのみスクロール（flex-1 min-h-0 で高さを拘束） */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="px-6 py-6">
                <EventFormInputs control={form.control} />
              </div>
            </div>

            {/* Footer: 常に下に固定 */}
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