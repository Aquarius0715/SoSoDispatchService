"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useSnackbar } from "@/components/ui/snackbar";

import { updateMe } from "@/requests/userAPI";
import { statusEditSchema, type StatusEditValues } from "./schema";
import { UserStatusInputs } from "./components/UserStatusInputs";

// ★あなたの AuthContext に合わせて import を直す
import { useAuthState, useAuthActions } from "@/contexts/AuthContext";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function StatusEditDialog({ open, onOpenChange }: Props) {
  const { user } = useAuthState();
  const { fetchMe } = useAuthActions();
  const { showSnackbar } = useSnackbar();

  const defaultValues = useMemo<StatusEditValues>(() => {
    return {
      username: user?.username ?? "",
      mailAddress: user?.mailAddress ?? "",
      hasCar: user?.hasCar ?? false,
      capacity: user?.hasCar ? (user?.capacity ?? 1) : 0,
    };
  }, [user]);

  const form = useForm<StatusEditValues>({
    resolver: zodResolver(statusEditSchema),
    defaultValues,
    values: defaultValues, // user 更新時にフォームも追従させる
  });

  const hasCar = form.watch("hasCar");

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        username: values.username,
        mailAddress: values.mailAddress,
        hasCar: values.hasCar,
        capacity: values.hasCar ? values.capacity : 0,
      };

      await updateMe(payload);

      // Context の user を最新へ
      await fetchMe();

      showSnackbar("ステータスを更新しました", "success");
      onOpenChange(false);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        showSnackbar(e.response?.data?.message ?? "更新に失敗しました", "error");
      } else {
        showSnackbar("更新に失敗しました", "error");
      }
    }
  });

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
