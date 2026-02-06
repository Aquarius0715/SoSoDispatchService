'use client';

import React from 'react';
import { useMainView } from '@/views/DashboardView/main-view/components/useMainView';
import CalendarMainView from '@/views/DashboardView/main-view/components/CalendarMainView';
import EventAddView from '@/views/DashboardView/main-view/components/EventAddView'; 
import EventDetailView from '@/views/DashboardView/main-view/components/EventDetail';

export default function CalendarPage() {
  // useMainView に詳細表示用の状態（selectedEventなど）が含まれている前提です
  const {
    events,
    isAddModalOpen,
    isDetailModalOpen,
    selectedEvent,
    formState,
    handleAddEventClick,
    handleEventClick,
    handleCloseAddModal,
    handleCloseDetailModal,
    handleSubmit,
    toggleParticipant,
  } = useMainView();

  return (
    <main className="flex flex-col h-screen bg-slate-50">
      {/* カレンダー本体 */}
      <CalendarMainView
        events={events}
        onEventClick={handleEventClick} // ここで selectedEvent がセットされる想定
        onAddEventClick={handleAddEventClick}
      />

      {/* イベント追加モーダル */}
      <EventAddView
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        formState={formState}
        toggleParticipant={toggleParticipant}
        handleSubmit={handleSubmit}
      />

      {/* isDetailModalOpen が true かつ selectedEvent がある場合のみ表示 */}
      {isDetailModalOpen && selectedEvent && (
        <EventDetailView 
          // 基本データ
          eventData={selectedEvent} 
          onClose={handleCloseDetailModal}
          
          // 詳細データ（APIから取得したデータなど）
          detailData={null} 
          
          // 配車の空き状況 (extendedPropsから取得)
          dropOffRemaining={selectedEvent.extendedProps?.dropOffCount ?? 0}
          pickUpRemaining={selectedEvent.extendedProps?.pickUpCount ?? 0}
          
          // 登録済みメンバー
          registered={selectedEvent.extendedProps?.participants ?? []}
          
          // ユーザーの状態
          isLoadingRegistrations={false}
          userDropOffRegistered={false}
          userPickUpRegistered={false}
          isRegistering={false}
          seatsRequired={1}
          
          // 登録ボタンが押された時の処理
          onRegister={(type) => {
            // TODO: 登録処理の実装 (type は 'dropOff' または 'pickUp')
            console.log('Register clicked:', type);
          }}
        />
      )}
      </main>
  )
}