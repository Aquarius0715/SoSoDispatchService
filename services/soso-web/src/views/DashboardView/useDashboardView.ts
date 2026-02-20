'use client';

import { useState, useCallback, useEffect } from 'react';
import { EventClickArg } from '@fullcalendar/core'; // FullCalendarの型をインポート
import { listEvents } from '@/requests/eventAPI';
import { Event } from '@/types/interfaces';
import type { EventData } from '@/types/interfaces';
import { useSnackbar } from '@/components/ui/snackbar';

export const useDashboardView = (calendarId: string) => {
  const { showSnackbar } = useSnackbar();

  // --- 状態管理 ---
  // FullCalendarには EventData 型の配列をそのまま渡せる（構造に互換性があるため）
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
      const rawEvents: Event[] = await listEvents(calendarId);

      const formattedEvents: EventData[] = rawEvents.map((ev) => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.startTime),
        end: new Date(ev.endTime),
        url: '', // 必要ならセット
        extendedProps: {
          description: ev.description,
          originLocation: ev.originLocation,
          destinationLocation: ev.destinationLocation,
          seatsRequiredGo: ev.seatsRequiredGo,
          seatsRequiredReturn: ev.seatsRequiredReturn,
          dropOffCount: 0, 
          pickUpCount: 0,
          participants: ev.participantUserIds || [], // string[]として扱う
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

  useEffect(() => {
    reloadEvents();
  }, [reloadEvents]);

  // --- 2. ハンドラー群 (ここを修正) ---

  // カレンダーの日付セルクリック時
  // FullCalendarからは Date オブジェクトが来るので、ここで文字列に変換する
  const handleAddEventClick = (date: Date) => {
    // ローカルタイムで YYYY-MM-DD 形式に変換
    const dateStr = date.toLocaleDateString('en-CA'); 
    setSelectedDate(dateStr);
    setIsAddOpen(true);
  };

  // カレンダーのイベントクリック時
  // FullCalendarからは EventClickArg が来るので、そこから EventData を復元する
  const handleEventClick = (info: EventClickArg) => {
    const rawEvent = info.event;
    
    // extendedProps は unknown 型に近いので、型アサーションで整形
    const props = rawEvent.extendedProps;

    const eventData: EventData = {
      id: rawEvent.id,
      title: rawEvent.title,
      start: rawEvent.start!,
      end: rawEvent.end!,
      url: rawEvent.url,
      extendedProps: {
        description: props.description,
        originLocation: props.originLocation,
        destinationLocation: props.destinationLocation,
        seatsRequiredGo: props.seatsRequiredGo,
        seatsRequiredReturn: props.seatsRequiredReturn,
        dropOffCount: props.dropOffCount,
        pickUpCount: props.pickUpCount,
        participants: props.participants,
      }
    };

    setSelectedEvent(eventData);
    setIsDetailOpen(true);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
    setSelectedDate(null);
  };

  const closeDetailModal = () => {
    setIsDetailOpen(false);
    setSelectedEvent(null);
  };

  return {
    events,
    isLoading,
    isAddOpen,
    selectedDate,
    isDetailOpen,
    selectedEvent,
    reloadEvents,
    handleAddEventClick,
    handleEventClick,
    closeAddModal,
    closeDetailModal,
  };
};