'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEvent } from "@/requests/eventAPI";
import { listCalendarMembers } from "@/requests/calendarDetailAPI";
import { CalendarMember, EventCreateRequest } from "@/types/interfaces";
import { eventAddSchema, type EventAddValues } from "./schema";
import { useSnackbar } from "@/components/ui/snackbar";
import axios from "axios";

interface UseEventAddDialogProps {
  calendarId: string;
  selectedDate: string; // "2026-02-08" 形式
  onSuccess: () => void;
  onClose: () => void;
}

export const useEventAddDialog = ({
  calendarId,
  selectedDate,
  onSuccess,
  onClose,
}: UseEventAddDialogProps) => {
  const { showSnackbar } = useSnackbar();

  // 参加者候補は「このカレンダーの実メンバー」を API から取得する。
  // ここで得る member.id はバックエンドで users.id にマッピングされた値なので、
  // そのまま participantUserIds として送れば FK 制約(fk_rp_user)を満たす。
  const [members, setMembers] = useState<CalendarMember[]>([]);

  useEffect(() => {
    if (!calendarId) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await listCalendarMembers(calendarId);
        if (!cancelled) setMembers(list);
      } catch {
        if (!cancelled) setMembers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [calendarId]);

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

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // 1. APIが求める EventCreateRequest 形式にデータを加工
      const payload: EventCreateRequest = {
        title: values.title,
        description: values.description,
        startTime: `${selectedDate}T${values.dropOffTime}:00+09:00`,
        endTime: `${selectedDate}T${values.pickUpTime}:00+09:00`,
        originLocation: values.originLocation,
        destinationLocation: values.destinationLocation,
        seatsRequiredGo: Number(values.pickUpCount),
        seatsRequiredReturn: Number(values.dropOffCount),
        participantUserIds: values.participantUserIds,
      };

      // 2. API窓口を呼び出し
      await createEvent(calendarId, payload);
      // 3. 成功時の処理
      showSnackbar("イベントを作成しました", "success");
      onSuccess(); // 親コンポーネント（カレンダー）を再読み込み
      onClose();   // モーダルを閉じる
      form.reset();

    } catch (error) {
      // 4. エラーハンドリング
      let message = "イベントの作成に失敗しました";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      showSnackbar(message, "error");
      form.setError("root.server", { message });
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    members,
  };
};