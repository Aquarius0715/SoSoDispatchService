'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// UIコンポーネント
import CalendarHeader from '@/components/Headers/CalendarHeader';
import CalendarLeftSidebar from '@/components/Sidebar/CalendarSidebar';
import CalendarRightSidebar from '@/components/Sidebar/CalendarRightSidebar';
import CalendarMainView from '@/views/DashboardView/main-view/CalendarMainView'; // カレンダーUI
import EventDetailView from '@/views/DashboardView/main-view/EventDetailView';   // 詳細モーダルUI

// フック・型定義
import { useEventDetail } from '@/views/DashboardView/main-view/useEventDetail';      // ロジック
import { EventDetails } from '@/types/interfaces';
import { Member } from '@/components/MemberList/MenberList';
import { SOSOTransaction } from '@/components/SOSOList/SOSOList';

// ※ その他のモーダル(EventAddModalなど)も必要に応じてインポートしてください

export default function DashboardPage() {
  const router = useRouter();
  const { id, slug } = useParams() as { id: string; slug: string };
  
  // --- State ---
  const [events, setEvents] = useState<any[]>([]); // CalendarMainViewに渡す用 (anyは適宜EventInputに修正)
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<SOSOTransaction[]>([]);
  
  // モーダル制御: 選択されたイベント
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);

  // ★ フックの使用 (selectedEvent が null なら内部処理はスキップされる設計)
  const eventDetailLogic = useEventDetail(selectedEvent);

  // --- ハンドラ ---
  
  // カレンダーのイベントクリック時の処理
  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    
    // FullCalendarのイベントオブジェクトを EventDetails 型に変換してセット
    // (extendedPropsなどに必要なデータが入っている前提)
    const eventData: EventDetails = {
      id: event.id,
      title: event.title,
      date: event.startStr,
      details: event.extendedProps?.details || '',
      dropOffTime: event.startStr,
      pickUpTime: event.endStr,
      dropOffCount: event.extendedProps?.dropOffCount || 0,
      pickUpCount: event.extendedProps?.pickUpCount || 0,
      departurePoint: event.extendedProps?.departurePoint || '',
      destinationPoint: event.extendedProps?.destinationPoint || '',
      members: event.extendedProps?.members || [],
      eventURL: event.extendedProps?.eventURL,
      // ... 他の必要なプロパティ
    };

    setSelectedEvent(eventData);
  };

  // カレンダーの「+」ボタンクリック時
  const handleAddEventClick = (e: React.MouseEvent, arg: any) => {
    e.stopPropagation();
    console.log('日付クリック:', arg.dateStr);
    // TODO: EventAddModal を開く処理などをここに書く
  };

  // ログアウトなど
  const handleLogout = () => { /* ... */ };

  // --- データ取得などのuseEffectは省略 (元のコードから移植してください) ---
  // useEffect(() => { fetchEvents... }, []);


  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <CalendarHeader
        pageTitle={slug ? decodeURIComponent(slug) : 'Dashboard'}
        onLogout={handleLogout}
        onClickLogo={() => router.push('/calendarList')}
        calendarUrl=""
      />
      
      <div className="flex flex-grow overflow-hidden">
        <CalendarLeftSidebar members={members} className="h-full" />
        
        {/* ▼ カレンダー表示 (Presentation Component) */}
        <CalendarMainView 
          events={events}
          onEventClick={handleEventClick}
          onAddEventClick={handleAddEventClick}
        />

        <CalendarRightSidebar logs={logs} className="h-full" />
      </div>

      {/* ▼ イベント詳細モーダル (Presentation Component) */}
      {selectedEvent && (
        <EventDetailView
          // 1. 親(Page)が制御するProps
          onClose={() => setSelectedEvent(null)}
          eventData={selectedEvent}
          
          // 2. フックから返ってきたロジック系Propsをすべて渡す
          {...eventDetailLogic}
        />
      )}

      {/* その他のモーダル (AddModalなど) */}
    </div>
  );
}