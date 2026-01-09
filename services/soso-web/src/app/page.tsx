'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';

// --- UIコンポーネント (Views) ---
import CalendarHeader from '@/views/DashboardView/main-view/components/Headers/CalendarHeader';
import CalendarLeftSidebar from '@/views/DashboardView/main-view/components/Sidebar/CalendarSidebar';
import CalendarRightSidebar from '@/views/DashboardView/main-view/components/Sidebar/CalendarRightSidebar';
import CalendarMainView from '@/views/DashboardView/main-view/CalendarMainView'; // カレンダーUI
import EventDetailView from '@/views/DashboardView/main-view/EventDetailView';   // 詳細モーダルUI
import EventAddView from '@/views/DashboardView/main-view/EventAddView';         // 新規追加モーダルUI

// --- ロジック (Hooks) ---
import { useEventDetail } from '@/views/DashboardView/main-view/useEventDetail';
import { useEventAdd } from '@/views/DashboardView/main-view/useEventAdd';

// --- 型定義 ---
import { EventDetails, EventStatus } from '@/types/interfaces';
import { Member } from '@/views/DashboardView/main-view/components/MemberList/MenberList';
import { SOSOTransaction } from '@/views/DashboardView/main-view/components/SOSOList/SOSOList';
import { EventInput } from '@fullcalendar/core';

// APIベースURL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// 新規追加時のデフォルト値
const DEFAULT_EVENT_STATUS: EventStatus = {
  date: '',
  title: '',
  details: '',
  dropOffTime: '09:00',
  pickUpTime: '18:00',
  dropOffCount: 0,
  pickUpCount: 0,
  departurePoint: '',
  destinationPoint: '',
  members: [],
};

export default function DashboardPage() {
  const router = useRouter();
  const { id, slug } = useParams() as { id: string; slug: string };

  // --- 1. グローバルState (ページ全体で共有するデータ) ---
  const [events, setEvents] = useState<EventInput[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<SOSOTransaction[]>([]);
  const [decodedTitle, setDecodedTitle] = useState<string>('');

  // --- 2. モーダル制御用State ---
  // 詳細モーダル用
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  
  // 新規追加モーダル用
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addInitialStatus, setAddInitialStatus] = useState<EventStatus>(DEFAULT_EVENT_STATUS);

  // --- 3. ロジックフックの呼び出し ---
  
  // 詳細モーダルのロジック (selectedEventがnullの時は何もしない)
  const eventDetailLogic = useEventDetail(selectedEvent);

  // 新規追加モーダルの保存処理
  const handleSaveNewEvent = async (status: EventStatus) => {
    console.log("🔵 新規イベント保存:", status);
    
    // ここにAPI送信ロジックを実装
    // (例: fetch(`${API_BASE}/events`, { method: 'POST', body: ... }) )
    
    // 成功したらモーダルを閉じてイベントを再取得するなどの処理
    // setIsAddModalOpen(false); // Hook内でonSave後に閉じるか、ここで閉じるか設計による
    alert('イベントを作成しました(コンソールを確認してください)');
    
    // イベント再取得 (fetchEventsの実装が必要)
    // await fetchEvents(id);
  };

  // 新規追加モーダルのロジック
  const eventAddLogic = useEventAdd(
    addInitialStatus, 
    handleSaveNewEvent, 
    isAddModalOpen
  );

  // --- 4. イベントハンドラ ---

  // カレンダーの「既存イベント」クリック時
  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const props = event.extendedProps;

    // FullCalendarのデータを EventDetails 型に変換
    const eventData: EventDetails = {
      id: event.id,
      title: event.title,
      date: event.startStr, // 必要に応じてフォーマット調整
      details: props?.details || '',
      dropOffTime: props?.dropOffTime || event.startStr,
      pickUpTime: props?.pickUpTime || event.endStr,
      dropOffCount: props?.dropOffCount || 0,
      pickUpCount: props?.pickUpCount || 0,
      departurePoint: props?.departurePoint || '',
      destinationPoint: props?.destinationPoint || '',
      members: props?.members || [],
      eventURL: props?.eventURL,
      dispatchRegistered: props?.dispatchRegistered || [],
    };

    setSelectedEvent(eventData); // これにより詳細モーダルが開く
  };

  // カレンダーの「＋」ボタンクリック時
  const handleAddEventClick = (e: React.MouseEvent, arg: any) => {
    e.stopPropagation();
    
    // クリックされた日付を取得
    const clickedDate = arg.dateStr; // "2026-01-10"
    console.log("🔵 新規追加クリック:", clickedDate);

    // 初期値をセットしてモーダルを開く
    setAddInitialStatus({
      ...DEFAULT_EVENT_STATUS,
      date: clickedDate,
      // メンバーリストの初期値として全メンバー名を入れる場合
      members: members.map(m => m.username), 
    });
    setIsAddModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/');
  };

  const handleLogoClick = () => {
    router.push('/calendarList');
  };

  // --- 5. データ取得 (useEffect) ---
  useEffect(() => {
    if (slug) setDecodedTitle(decodeURIComponent(slug));
  }, [slug]);

  // ★ ここに fetchEvents や fetchMembers などのデータ取得ロジックが入ります
  // (元のコードにあった useEffect をそのまま利用してください)
  useEffect(() => {
    // ダミーデータのセット例 (API実装までのつなぎ)
    if (events.length === 0) {
      setEvents([
        { id: '1', title: 'ダミー会議', start: '2026-01-15' }
      ]);
      setMembers([
        { id: '1', name: '田中太郎', hasCar: true, seatsRequired: 4, sosoPoint: 10 },
        { id: '2', name: '佐藤花子', hasCar: false, seatsRequired: 1, sosoPoint: 5 },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  // --- 6. レンダリング ---
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <CalendarHeader
        pageTitle={decodedTitle}
        onLogout={handleLogout}
        onClickLogo={handleLogoClick}
        calendarUrl={`https://example.com/share/${id}`}
      />
      
      <div className="flex flex-grow overflow-hidden">
        {/* 左サイドバー */}
        <CalendarLeftSidebar 
          members={members} 
          className="h-full" 
        />
        
        {/* メインビュー: カレンダー (View) */}
        <CalendarMainView 
          events={events}
          onEventClick={handleEventClick}
          onAddEventClick={handleAddEventClick}
        />

        {/* 右サイドバー */}
        <CalendarRightSidebar 
          logs={logs} 
          className="h-full" 
        />
      </div>

      {/* --- モーダル領域 --- */}

      {/* 1. イベント詳細モーダル (View + Hook) */}
      {selectedEvent && (
        <EventDetailView
          onClose={() => setSelectedEvent(null)}
          eventData={selectedEvent}
          {...eventDetailLogic} // Hookから返されたロジック・状態を全て渡す
        />
      )}

      {/* 2. イベント追加モーダル (View + Hook) */}
      {isAddModalOpen && (
        <EventAddView 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          {...eventAddLogic} // Hookから返されたフォーム状態・ハンドラを全て渡す
        />
      )}

    </div>
  );
}