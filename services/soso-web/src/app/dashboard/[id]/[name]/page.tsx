'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import { EventInput } from '@fullcalendar/core';
import { CalendarReservationProvider, useCalendarReservation } from '@/src/context/CalendarReservationContext';
import { Reservation } from '@/src/types';

function CalendarInner() {
  const { name } = useParams() as { id: string; name: string };
  const { reservations, members, createReservation, updateReservation, deleteReservation } = useCalendarReservation();

  const events: EventInput[] = useMemo(() =>
    reservations.map((r: Reservation) => ({
      id: r.id,
      title: r.title,
      start: r.start,
      end: r.end,
      extendedProps: {
        details: r.details ?? '',
        departurePoint: r.departurePoint ?? '',
        destinationPoint: r.destinationPoint ?? '',
        members: r.members,
      },
    })),
  [reservations]);

  const handleDayAdd = (dateStr: string) => {
    const title = window.prompt('タイトルを入力してください');
    if (!title) return;
    const start = new Date(dateStr);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    createReservation(name, {
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      members: [],
      details: '',
      departurePoint: '',
      destinationPoint: '',
    });
  };

  const handleEventClick = async (clickInfo: any) => {
    const id = String(clickInfo.event.id);
    const currentTitle = String(clickInfo.event.title || '');
    const action = window.prompt('編集=1 / 削除=2 を入力', '1');
    if (action === '2') {
      const ok = window.confirm('この予約を削除しますか？');
      if (ok) await deleteReservation(name, id);
      return;
    }
    if (action === '1') {
      const title = window.prompt('新しいタイトルを入力', currentTitle) || currentTitle;
      await updateReservation(name, id, { title });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-72 h-full bg-white p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">メンバー一覧</h2>
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="text-sm text-gray-700">{m.memberName}{m.hasCar ? ' (車あり)' : ''}</li>
          ))}
        </ul>
      </aside>
      <main className="flex-grow p-6 overflow-y-auto">
        <div className="p-4 bg-white rounded-lg shadow">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={jaLocale}
            headerToolbar={{ left: 'prev,next', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
            events={events}
            eventClick={handleEventClick}
            dayCellContent={(arg) => (
              <div className="relative w-full h-full">
                <div className="absolute top-0 right-[63px] text-sm text-gray-800 pointer-events-none z-10">
                  {arg.dayNumberText.replace('日', '')}
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDayAdd(arg.date.toISOString()); }}
                  className="absolute top-0 right-2 text-black text-base font-bold hover:opacity-70 hover:scale-105 transition-transform"
                  aria-label="予定を追加"
                >
                  +
                </button>
              </div>
            )}
            eventContent={(arg) => (
              <div className="flex items-center justify-center w-full h-full text-xs text-gray-800 text-center truncate">
                {arg.event.title}
              </div>
            )}
          />
        </div>
      </main>
      <aside className="w-72 h-full bg-white p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ポイント</h2>
        <p className="text-sm text-gray-500">ポイント機能は後日実装予定</p>
      </aside>
    </div>
  );
}

export default function DashboardIdNamePage() {
  const { name } = useParams() as { id: string; name: string };
  return (
    <CalendarReservationProvider name={name}>
      <CalendarInner />
    </CalendarReservationProvider>
  );
}


