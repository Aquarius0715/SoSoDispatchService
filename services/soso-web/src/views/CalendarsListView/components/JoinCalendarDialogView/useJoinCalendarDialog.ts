"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import type { Calendar } from "@/types/interfaces";
import { useSnackbar } from "@/components/ui/snackbar";
import { getCalendarById, joinCalendar } from "@/requests/calendarAPI";

const toErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as unknown;
    const msg = (data as { message?: unknown } | undefined)?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof error.message === "string" && error.message.trim()) return error.message;
  }
  return "予期せぬエラーが発生しました";
};

type Args = {
  open: boolean;
  calenderId: string | null;
  onClose: () => void;
  onJoined: () => Promise<void>;
};

export function useJoinCalendarDialog({ open, calenderId, onClose, onJoined }: Args) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!open || !calenderId) {
      setCalendar(null);
      setHasLoadError(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setHasLoadError(false);
      try {
        const c = await getCalendarById(calenderId);
        if (!cancelled) setCalendar(c);
      } catch (e) {
        if (cancelled) return;

        setHasLoadError(true);

        // 取得できないなら not-found へ
        if (axios.isAxiosError(e) && (e.response?.status === 404 || e.response?.status === 403)) {
          router.replace("/not-found");
          return;
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, calenderId, router]);

  const onBack = useCallback(() => {
    onClose();
  }, [onClose]);

  const onJoin = useCallback(async () => {
    if (!calenderId) return;

    setIsJoining(true);
    try {
      await joinCalendar(calenderId);

      showSnackbar("カレンダーに参加しました", "success");
      await onJoined(); // 一覧を更新
      onClose();
    } catch (e) {
      // 既に参加している
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        showSnackbar("すでにカレンダーに参加しています。", "error");
        onClose();
        return;
      }

      showSnackbar(toErrorMessage(e), "error");
    } finally {
      setIsJoining(false);
    }
  }, [calenderId, onClose, onJoined, showSnackbar]);

  return { calendar, isLoading, hasLoadError, isJoining, onJoin, onBack };
}