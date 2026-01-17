"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { UserStatusInputs } from "./components/UserStatusInputs";
import { useStatusEditDialogView } from "./useStatusEditDialogView"

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function StatusEditDialog({ open, onOpenChange }: Props) {
  const { user, form, hasCar, onSubmit } = useStatusEditDialogView(() =>
    onOpenChange(false)
  );

  // user がないならそもそも表示しない
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ステータス編集</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <UserStatusInputs
              control={form.control}
              hasCar={hasCar}
              setValue={form.setValue}
              getValues={form.getValues}
              clearErrors={form.clearErrors}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              編集完了
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
