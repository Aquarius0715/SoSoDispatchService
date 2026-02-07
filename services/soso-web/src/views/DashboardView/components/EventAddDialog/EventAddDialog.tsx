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
import { Form } from "@/components/ui/form"; // shadcn/ui
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";

import { eventAddSchema, type EventAddValues } from "./schema";
import { EventFormInputs } from "./components/EventFormInputs";

interface EventAddDialogProps {
  isOpen: boolean; // 今、ダイアログが開いているか
  onClose: () => void; //モーダルを閉じるとき
  selectedDate: string; // カレンダーで選ばれた日付
  calenderId: string;
  onSuccess: () => void; // 作成成功時のリロード用
}

const EventAddDialog: React.FC<EventAddDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  calenderId,
  onSuccess
}) => {
  // 本来は useEventAddDialog.ts に切り出すのが理想ですが、
  // ここでは RegisterView 同様のロジック構造を示します
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
      // API連携ロジックをここに記述
      // startTime: `${selectedDate}T${values.dropOffTime}:00Z` などの加工を行う
      console.log("Submit Data:", values);
      
      onSuccess();
      onClose();
      form.reset();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            予定を追加 ({selectedDate})
          </DialogTitle>
        </DialogHeader>

        {/* RegisterViewと同じくFormで包む */}
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 px-1">
              <EventFormInputs control={form.control} />
            </ScrollArea>

            <DialogFooter className="p-6 pt-4 border-t bg-white shrink-0">
              <Button variant="outline" type="button" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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