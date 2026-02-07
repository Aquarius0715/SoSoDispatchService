// src/views/DashboardView/useDashboardView.ts
import { useState, useEffect, useCallback } from 'react';
import { EventInput, EventClickArg } from '@fullcalendar/core';

// 仮のAPI関数（実際の実装に合わせて書き換えてください）
// import { fetchEvents } from '@/requests/eventAPI';

export const useDashboardView = (calenderId: string) => {
  const [events, setEvents] = useState<EventInput[]>([]);
  
  // --- モーダルの開閉状態管理 ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- 選択されたデータ管理 ---
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // --- データ取得 ---
  const loadEvents = useCallback(async () => {
    try {
      // APIからデータを取得する処理
      // const data = await fetchEvents(calenderId);
      // setEvents(data);
      
      console.log(`Fetching events for calendar: ${calenderId}`);
      // 仮データ
      setEvents([
        {
          id: '1',
          title: 'ミーティング',
          start: '2026-02-10T10:00:00',
          end: '2026-02-10T11:00:00',
          extendedProps: {
            description: '定例会議',
            participants: ['佐藤', '田中'],
            dropOffCount: 2,
            pickUpCount: 1,
            seatsRequiredGo: 4,
            seatsRequiredReturn: 4,
          }
        }
      ]);
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  }, [calenderId]);

  // 初回マウント時にデータ取得
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // --- ハンドラー ---

  // 1. 予定追加ボタンクリック (+ボタン)
  const handleAddEventClick = (date: Date) => {
    // Dateオブジェクトを "YYYY-MM-DD" 文字列に変換
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setIsAddOpen(true);
  };

  // 2. 予定クリック (詳細表示)
  const handleEventClick = (info: EventClickArg) => {
    // FullCalendarのイベントオブジェクトを整形して渡す
    const eventData = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      url: info.event.url,
      extendedProps: info.event.extendedProps,
    };
    setSelectedEvent(eventData);
    setIsDetailOpen(true);
  };

  return {
    events,
    reloadEvents: loadEvents, // モーダルから再取得を呼べるようにする
    
    // 追加モーダル用
    isAddOpen,
    openAddModal: () => setIsAddOpen(true),
    closeAddModal: () => setIsAddOpen(false),
    selectedDate,
    handleAddEventClick,

    // 詳細モーダル用
    isDetailOpen,
    openDetailModal: () => setIsDetailOpen(true),
    closeDetailModal: () => setIsDetailOpen(false),
    selectedEvent,
    handleEventClick,
  };
};