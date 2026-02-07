"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { useSnackbar } from "@/components/ui/snackbar";
import { updateMe } from "@/requests/userAPI";
import { statusEditSchema, type StatusEditValues } from "./schema";
import { useAuthState, useAuthActions } from "@/contexts/AuthContext";

export type UseStatusEditDialogResult = {
  user: ReturnType<typeof useAuthState>["user"];
  form: ReturnType<typeof useForm<StatusEditValues>>;
  hasCar: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
};

export function useStatusEditDialogView(
  onClose: () => void
): UseStatusEditDialogResult {
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
    values: defaultValues, // user 更新時にフォームも追従
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
      await fetchMe(); // Context の user を最新へ

      showSnackbar("ステータスを更新しました", "success");
      onClose();
    } catch (e) {
      if (axios.isAxiosError(e)) {
        showSnackbar(e.response?.data?.message ?? "更新に失敗しました", "error");
      } else {
        showSnackbar("更新に失敗しました", "error");
      }
    }
  });

  return { user, form, hasCar, onSubmit };
}
