// src/views/CalendersListView/useCalendersListView.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import type { Calender } from "@/types/interfaces";
import { useSnackbar } from "@/components/ui/snackbar";
import { createCalender, getMyCalenders } from "@/requests/calenderAPI";
import { createCalenderSchema } from "./components/CreateCalenderDialogView/schema";

const toErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as unknown;
    const msg = (data as { message?: unknown } | undefined)?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof error.message === "string" && error.message.trim())
      return error.message;
  }
  return "予期せぬエラーが発生しました";
};

export type UseCalendersListViewResult = {
  calenders: Calender[];
  isLoading: boolean;
  isCreating: boolean;

  // create modal
  isCreateOpen: boolean;
  setIsCreateOpen: (v: boolean) => void;
  newCalenderName: string;
  setNewCalenderName: (v: string) => void;
  newCalenderDescription: string;
  setNewCalenderDescription: (v: string) => void;

  reload: () => Promise<void>;
  create: () => Promise<void>;

  createDisabled: boolean;
};

export function useCalendersListView(): UseCalendersListViewResult {
  const { showSnackbar } = useSnackbar();

  const [calenders, setCalenders] = useState<Calender[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCalenderName, setNewCalenderName] = useState("");
  const [newCalenderDescription, setNewCalenderDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getMyCalenders();
      setCalenders(list);
    } catch (e) {
      showSnackbar(toErrorMessage(e), "error");
    } finally {
      setIsLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createDisabled = useMemo(() => {
    if (isCreating) return true;

    const parsed = createCalenderSchema.safeParse({
      name: newCalenderName,
      description: newCalenderDescription,
    });

    return !parsed.success;
  }, [isCreating, newCalenderDescription, newCalenderName]);

  const create = useCallback(async () => {
    const parsed = createCalenderSchema.safeParse({
      name: newCalenderName,
      description: newCalenderDescription,
    });

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const message =
        flat.name?.[0] ?? flat.description?.[0] ?? "入力内容を確認してください";
      showSnackbar(message, "error");
      return;
    }

    setIsCreating(true);
    try {
      await createCalender(parsed.data);
      showSnackbar("カレンダーを作成しました", "success");
      setIsCreateOpen(false);
      setNewCalenderName("");
      setNewCalenderDescription("");
      await reload();
    } catch (e) {
      showSnackbar(toErrorMessage(e), "error");
    } finally {
      setIsCreating(false);
    }
  }, [newCalenderDescription, newCalenderName, reload, showSnackbar]);

  return {
    calenders,
    isLoading,
    isCreating,
    isCreateOpen,
    setIsCreateOpen,
    newCalenderName,
    setNewCalenderName,
    newCalenderDescription,
    setNewCalenderDescription,
    reload,
    create,
    createDisabled,
  };
}
