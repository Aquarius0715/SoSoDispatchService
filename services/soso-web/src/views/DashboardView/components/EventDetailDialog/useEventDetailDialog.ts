'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getEventDetail, 
  registerPickupDriver, 
  registerReturnDriver, 
  EventDetail 
} from "@/requests/eventAPI";
import { useSnackbar } from "@/components/ui/snackbar";
import axios from "axios";

interface UseEventDetailDialogProps {
  eventId: string;
  isOpen: boolean;
  onEventUpdated: () => void; // 登録成功時にカレンダーを更新するためのコールバック
}

export const useEventDetailDialog = ({
  eventId,
  isOpen,
  onEventUpdated,
}: UseEventDetailDialogProps) => {
  const { showSnackbar } = useSnackbar();
  
  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // 1. イベント詳細情報の取得
  const loadEventDetail = useCallback(async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      const fetcher = getEventDetail(eventId);
      const data = await fetcher();
      setEventData(data);
    } catch (error) {
      console.error(error);
      showSnackbar("イベント情報の取得に失敗しました", "error");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, showSnackbar]);

  // モーダルが開いた時にデータをロード
  useEffect(() => {
    if (isOpen) {
      loadEventDetail();
    }
  }, [isOpen, loadEventDetail]);

  // 2. 配車登録アクション (行き/帰り)
  const handleRegisterDriver = async (type: 'pickup' | 'return') => {
    if (!eventId) return;

    setIsActionLoading(true);
    try {
      if (type === 'pickup') {
        const poster = registerPickupDriver(eventId);
        await poster();
      } else {
        const poster = registerReturnDriver(eventId);
        await poster();
      }

      showSnackbar(`${type === 'pickup' ? '迎え' : '送り'}ドライバーとして登録しました`, "success");
      
      // 登録成功後、最新の残席数を反映するために詳細を再読み込み
      await loadEventDetail();
      // 親（カレンダー）の表示も更新させる
      onEventUpdated();

    } catch (error) {
      let message = "登録に失敗しました。既に満席か、権限がない可能性があります。";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      showSnackbar(message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    eventData,
    isLoading,
    isActionLoading,
    handleRegisterDriver,
    refresh: loadEventDetail,
  };
};