'use client';

import { useState, useCallback, useEffect } from 'react';
import { listEvents, Event } from '@/requests/eventAPI';
import type { EventData } from '@/types/interfaces';
import { useSnackbar } from '@/components/ui/snackbar';

export const useDashboardView = (calendarId: string) => {
  const { showSnackbar } = useSnackbar();

  // --- 状態管理 ---
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // モーダル管理
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  // --- 1. イベント一覧の取得と変換 ---
  const reloadEvents = useCallback(async () => {
    if (!calendarId) return;

    setIsLoading(true);
    try {
      const fetcher = listEvents(calendarId);
      const rawEvents: Event[] = await fetcher();

      // APIの型(Event)をカレンダーの型(EventData)に変換（マッピング）
      const formattedEvents: EventData[] = rawEvents.map((ev) => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.startTime),
        end: new Date(ev.endTime),
        extendedProps: {
          description: ev.description,
          originLocation: ev.originLocation,
          destinationLocation: ev.destinationLocation,
          seatsRequiredGo: ev.seatsRequiredGo,
          seatsRequiredReturn: ev.seatsRequiredReturn,
          // 詳細APIで取る情報などは一旦初期値をセット
          dropOffCount: 0, 
          pickUpCount: 0,
          participants: [], 
        },
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error(error);
      showSnackbar("イベントの取得に失敗しました", "error");
    } finally {
      setIsLoading(false);
    }
  }, [calendarId, showSnackbar]);

  // 初回読み込み
  useEffect(() => {
    reloadEvents();
  }, [reloadEvents]);

  // --- 2. ハンドラー群 ---

  // カレンダーの日付セルクリック時（新規追加）
  const handleAddEventClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsAddOpen(true);
  };

  // カレンダーのイベントクリック時（詳細表示）
  const handleEventClick = (event: EventData) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  // モーダルを閉じる処理
  const closeAddModal = () => {
    setIsAddOpen(false);
    setSelectedDate(null);
  };

  const closeDetailModal = () => {
    setIsDetailOpen(false);
    setSelectedEvent(null);
  };

  return {
    // 状態
    events,
    isLoading,
    isAddOpen,
    selectedDate,
    isDetailOpen,
    selectedEvent,
    
    // アクション
    reloadEvents,
    handleAddEventClick,
    handleEventClick,
    closeAddModal,
    closeDetailModal,
  };
};