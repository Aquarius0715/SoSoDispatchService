'use client';

import React from 'react';
import { useMainView } from "@/views/DashboardView/main-view/useMainView";
import CalendarMainView from '@/views/DashboardView/components/CalendarMainView';
// ↓これから作る、あるいは既存のモーダルコンポーネント
import EventAddView from '@/views/DashboardView/components/EventAddView'; 

export default function CalendarPage() {
  // カスタムフックから必要な状態と関数をすべて取り出す
  const {
    events,
    isAddModalOpen,
    formState,
    handleAddEventClick,
    handleEventClick,
    handleCloseAddModal,
    handleSubmit,
    toggleParticipant
  } = useMainView();

  return (
    <main className="flex flex-col h-screen bg-slate-50">
      {/* カレンダー本体 */}
      <CalendarMainView
        events={events}
        onEventClick={handleEventClick}
        onAddEventClick={handleAddEventClick}
      />

      {/* イベント追加モーダル
         handleSubmit が呼ばれると、フック内の events 状態が更新され、
         その結果 CalendarMainView の表示も自動で更新されます。
      */}
      <EventAddView
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        formState={formState}
        toggleParticipant={toggleParticipant}
        handleSubmit={handleSubmit}
      />
    </main>
  );
}