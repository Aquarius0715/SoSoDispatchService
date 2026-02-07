// src/views/CalendarsListView/useCalendarsListView.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import type { Calendar } from "@/types/interfaces";
import { useSnackbar } from "@/components/ui/snackbar";
import { createCalendar, getMyCalendars } from "@/requests/calendarAPI";
import { createCalendarSchema } from "./components/CreateCalendarDialogView/schema";

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

export type UseCalendarsListViewResult = {
  calendars: Calendar[];
  isLoading: boolean;
  isCreating: boolean;

  // create modal
  isCreateOpen: boolean;
  setIsCreateOpen: (v: boolean) => void;
  newCalendarName: string;
  setNewCalendarName: (v: string) => void;
  newCalendarDescription: string;
  setNewCalendarDescription: (v: string) => void;

  reload: () => Promise<void>;
  create: () => Promise<void>;

  createDisabled: boolean;
};

export function useCalendarsListView(): UseCalendarsListViewResult {
  const { showSnackbar } = useSnackbar();

  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState("");
  const [newCalendarDescription, setNewCalendarDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getMyCalendars();
      setCalendars(list);
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

    const parsed = createCalendarSchema.safeParse({
      name: newCalendarName,
      description: newCalendarDescription,
    });

    return !parsed.success;
  }, [isCreating, newCalendarDescription, newCalendarName]);

  const create = useCallback(async () => {
    const parsed = createCalendarSchema.safeParse({
      name: newCalendarName,
      description: newCalendarDescription,
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
      await createCalendar(parsed.data);
      showSnackbar("カレンダーを作成しました", "success");
      setIsCreateOpen(false);
      setNewCalendarName("");
      setNewCalendarDescription("");
      await reload();
    } catch (e) {
      showSnackbar(toErrorMessage(e), "error");
    } finally {
      setIsCreating(false);
    }
  }, [newCalendarDescription, newCalendarName, reload, showSnackbar]);

  return {
    calendars,
    isLoading,
    isCreating,
    isCreateOpen,
    setIsCreateOpen,
    newCalendarName,
    setNewCalendarName,
    newCalendarDescription,
    setNewCalendarDescription,
    reload,
    create,
    createDisabled,
  };
}
