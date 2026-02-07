// src/views/DashboardView/DashboardView.tsx
'use client';

import React from 'react';
import { useDashboardView } from './useDashboardView';

// 作成したコンポーネント群をインポート
import { CalendarBoard } from './components/CalendarBoard/CalendarBoard';
import EventAddDialog from './components/EventAddDialog/EventAddDialog';
import { EventDetailDialog } from './components/EventDetailDialog/EventDetailDialog';

interface DashboardViewProps {
  calenderId: string;
}

export default function DashboardView({ calenderId }: DashboardViewProps) {
  // フックから必要な状態と関数を取り出す
  const {
    events,
    reloadEvents,
    
    isAddOpen,
    closeAddModal,
    selectedDate,
    handleAddEventClick,

    isDetailOpen,
    closeDetailModal,
    selectedEvent,
    handleEventClick,
  } = useDashboardView(calenderId);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50">
      
      {/* 1. カレンダー本体 */}
      <CalendarBoard 
        events={events}
        onEventClick={handleEventClick}
        onAddEventClick={handleAddEventClick}
        className="h-full"
      />

      {/* 2. イベント追加ダイアログ */}
      {/* isOpenがtrueの時だけ表示。selectedDateが必須なので空文字チェックも兼ねる */}
      {isAddOpen && selectedDate && (
        <EventAddDialog
          isOpen={isAddOpen}
          onClose={closeAddModal}
          selectedDate={selectedDate}
          calenderId={calenderId}
          onSuccess={reloadEvents} // 成功したらカレンダーを更新
        />
      )}

      {/* 3. イベント詳細ダイアログ */}
      {/* 選択されたイベントがある時だけ表示 */}
      {isDetailOpen && selectedEvent && (
        <EventDetailDialog
          isOpen={isDetailOpen}
          onClose={closeDetailModal}
          eventData={selectedEvent}
          onEventUpdated={reloadEvents} // 更新(参加登録など)したらカレンダーを更新
        />
      )}
    </div>
  );
}