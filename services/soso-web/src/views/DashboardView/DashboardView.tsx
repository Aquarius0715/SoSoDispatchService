'use client';

import React from 'react';
import { useDashboardView } from './useDashboardView';
import { CalendarBoard } from './components/CalendarBoard/CalendarBoard';
import EventAddDialog from './components/EventAddDialog/EventAddDialog';
import { EventDetailDialog } from './components/EventDetailDialog/EventDetailDialog';

interface DashboardViewProps {
  calendarId: string;
}

export default function DashboardView({ calendarId }: DashboardViewProps) {
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
  } = useDashboardView(calendarId);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50">
      
      {/* 1. カレンダー本体 */}
      <CalendarBoard 
        events={events as any} // 念のためキャストしておくのが無難ですが、互換性があれば不要
        onEventClick={handleEventClick}
        onAddEventClick={handleAddEventClick}
        className="h-full"
      />

      {/* 2. イベント追加ダイアログ */}
      {isAddOpen && selectedDate && (
        <EventAddDialog
          isOpen={isAddOpen}
          onClose={closeAddModal}
          selectedDate={selectedDate}
          calendarId={calendarId}
          onSuccess={reloadEvents}
        />
      )}

      {/* 3. イベント詳細ダイアログ */}
      {isDetailOpen && selectedEvent && (
        <EventDetailDialog
          isOpen={isDetailOpen}
          onClose={closeDetailModal}
          eventData={selectedEvent}
          onEventUpdated={reloadEvents}
        />
      )}
    </div>
  );
}