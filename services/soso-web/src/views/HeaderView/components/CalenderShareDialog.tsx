"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CalendarShareDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="
            rounded-md px-4
            bg-slate-600 text-white
            hover:bg-slate-700
          "
        >
          カレンダー共有
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>カレンダーを共有</DialogTitle>
          <DialogDescription>
            共有リンク発行・招待・権限管理などをここに実装します。
          </DialogDescription>
        </DialogHeader>

        {/* TODO */}
      </DialogContent>
    </Dialog>
  );
}
