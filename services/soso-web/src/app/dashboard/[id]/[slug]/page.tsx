'use client';

import React, { useState, useEffect } from 'react';
// ▼ 変更: NextPage を削除、useParams を追加
// import { NextPage } from 'next';
import { useRouter, useParams } from 'next/navigation'; // ← 追加

// 必要なコンポーネントをインポート
import CalendarHeader from '@/src/components/Headers/CalendarHeader';
import CalendarLeftSidebar from '@/src/components/Sidebar/CalendarSidebar';
import CalendarRightSidebar from '@/src/components/Sidebar/CalendarRightSidebar';
import { EventInput } from '@fullcalendar/core';
//カレンダー用インポート
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventAddModal from '@/src/components/Modal/EventAddModal';
import jaLocale from '@fullcalendar/core/locales/ja';
import SOSOManagementModal from '@/src/components/Modal/SOSOManagementModal';
import SOSOEditModal from '@/src/components/Modal/SOSOEditModal';
import EventDetailModal from '@/src/components/Modal/EventDetailModal';
import { EventDetails } from '@/src/components/Modal/EventDetailModal';
import Cookies from 'js-cookie';

// サイドバーで必要となるデータの型をインポート
import { Member } from '@/src/components/MemberList/MenberList';
import { SOSOTransaction } from '@/src/components/SOSOList/SOSOList';

// モーダルが返すデータの型
interface EditedMemberData extends Member {
  reason: string;
}

// EventStatus型をインポート（または再定義）
interface EventStatus {
  date: string;
  title: string;
  details: string;
  dropOffTime: string;
  pickUpTime: string;
  dropOffCount: number;
  pickUpCount: number;
  departurePoint: string;
  destinationPoint: string;
  members: string[];
}

interface EventProps {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps?: any;
}

// ★ export default function の書き方に変更
// ▼ 変更: params を受け取らない
export default function DashboardPage() {
  const router = useRouter();
  const { name } = useParams() as { name: string }; // ← 修正: 動的URLの [name] を取得

  // --- ▼▼▼ すべてのState管理をここにまとめる ▼▼▼ ---
  // ▼ 変更: 初期値に name を使う（UUIDなので decode 不要）
  const [nameState, setNameState] = useState<string>(name ?? '');
  const [decodedTitle, setDecodedTitle] = useState<string>(name ?? '');

  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [selectedManagementEvent, setSelectedManagementEvent] = useState<EventProps | null>(null);
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: 'チームミーティング', start: '2025-08-11T10:30:00', end: '2025-08-11T12:00:00' },
  ]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [members, setMembers] = useState<Member[]>([
    { id: 1, username: '佐藤 健太', hasCar: true, seatsRequired: 4, sosoPoint: 150 },
    { id: 2, username: '鈴木 陽子', hasCar: false, sosoPoint: 50 },
    { id: 3, username: '高橋 一郎', hasCar: false, sosoPoint: 80 },
    { id: 4, username: '伊藤 花子', hasCar: true, seatsRequired: 6, sosoPoint: 200 },
  ]);
  const [logs, setLogs] = useState<SOSOTransaction[]>([]);

  const [isSOSOEditModalOpen, setIsSOSOEditModalOpen] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<Member | null>(null);
  const [eventLogs, setEventLogs] = useState<{[eventId: string]: SOSOTransaction[]}>({});
  const [editSource, setEditSource] = useState<'sidebar' | 'management' | null>(null);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
  const [eventDetailData, setEventDetailData] = useState<EventDetails | null>(null);

  // --- ▼▼▼ useEffect ▼▼▼ ---
  // ▼ 削除: params を Promise として解決する処理は不要
  // useEffect(() => {
  //   console.log("🟡 useEffect: paramsが変更されました。");
  //   const resolveParams = async () => {
  //     const resolvedParams = await params;
  //     setName(resolvedParams.id);
  //     setDecodedTitle(decodeURIComponent(resolvedParams.id));
  //   };
  //   resolveParams();
  // }, [params]);

  // もしルートが変わる可能性があるなら（同じコンポーネント内で name が変化）
  // name 変化に合わせて state を追随させたい場合は以下を追加:
  useEffect(() => {
    if (!name) return;
    setNameState(name);
    setDecodedTitle(name);
  }, [name]);

  // --- ▼▼▼ 定数定義 ▼▼▼ ---
  const initialEventStatus: EventStatus = {
    date: '', title: '', details: '',
    dropOffTime: '', pickUpTime: '',
    dropOffCount: 0, pickUpCount: 0,
    departurePoint: '', destinationPoint: '',
    members: []
  };

  // --- ▼▼▼ ハンドラ関数 ▼▼▼ ---
  const handleSaveNewEvent = (eventData: EventStatus) => {
    console.log("🔵 handleSaveNewEventが実行されました。");
    const startDateTime = eventData.dropOffTime 
      ? `${eventData.date}T${eventData.dropOffTime}:00`
      : `${eventData.date}T09:00:00`;
    
    const endDateTime = eventData.pickUpTime 
      ? `${eventData.date}T${eventData.pickUpTime}:00`
      : `${eventData.date}T10:00:00`;

    const newEvent: EventInput = {
      id: Date.now().toString(),
      title: eventData.title,
      start: startDateTime,
      end: endDateTime,
      extendedProps: {
        details: eventData.details,
        dropOffTime: eventData.dropOffTime,
        pickUpTime: eventData.pickUpTime,
        dropOffCount: eventData.dropOffCount,
        pickUpCount: eventData.pickUpCount,
        departurePoint: eventData.departurePoint,
        destinationPoint: eventData.destinationPoint,
        members: eventData.members,
      }
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);
    setIsAddModalOpen(false);
    console.log('🔵 新しいイベントが追加されました:', newEvent);
  };

  const handleSaveManagement = (eventData: any) => {
    console.log("🔵 handleSaveManagementが実行されました。");
    console.log('🔵 Management data saved:', eventData);
    
    // メンバー編集アクションの場合
    if (eventData.extendedProps?.action === 'editMember') {
      const memberToEdit = eventData.extendedProps.editMember;
      console.log('🔵 メンバー編集要求:', memberToEdit);
      // 編集元を記録
      setEditSource('management');
      
      // 管理モーダルを閉じる
      setIsManagementModalOpen(false);
      
      // メンバー編集モーダルを開く
      setSelectedMemberForEdit(memberToEdit);
      setIsSOSOEditModalOpen(true);
      
      return;
    }

    // 通常の保存処理
    setIsManagementModalOpen(false);
    setSelectedManagementEvent(null); // ここでのみnullにする
  };

  // page.tsx のhandleSaveSosoChange関数を修正
  const handleSaveSosoChange = (editedData: EditedMemberData): void => {
    console.log("🔵 handleSaveSosoChangeが実行されました。");
    
    // メンバー情報を更新
    setMembers(currentMembers =>
      currentMembers.map(member =>
        member.id === editedData.id 
          ? { ...member, sosoPoint: editedData.sosoPoint } 
          : member
      )
    );
    
    // selectedMemberForEditから前の値を取得
    if (selectedMemberForEdit && selectedManagementEvent) {
      const pointChange = editedData.sosoPoint - selectedMemberForEdit.sosoPoint;
      if (pointChange !== 0) {
        const newLog: SOSOTransaction = {
          id: Date.now(),
          eventName: selectedManagementEvent.title,
          dateTime: new Date().toISOString(),
          changer: '管理者',
          changee: editedData.username,
          sosoPoints: pointChange,
          reason: editedData.reason || '（理由の記載なし）',
        };
        
        // 全体のログに追加
        setLogs(prevLogs => [newLog, ...prevLogs]);
        
        // ★★★ 新しいeventLogsを即座に計算 ★★★
        const updatedEventLogs = [
          newLog,
          ...(eventLogs[selectedManagementEvent.id] || [])
        ];
        
        // イベント固有のログに追加
        setEventLogs(prevEventLogs => ({
          ...prevEventLogs,
          [selectedManagementEvent.id]: updatedEventLogs
        }));
        
        // ★★★ 管理モーダルを即座に更新された履歴で再表示 ★★★
        const updatedEvent = {
          ...selectedManagementEvent,
          extendedProps: {
            ...selectedManagementEvent.extendedProps,
            eventLogs: updatedEventLogs // 新しく計算したログを使用
          }
        };
        
        console.log('🔵 更新されたイベントログ:', updatedEventLogs);
        console.log('🔵 更新されたイベント:', updatedEvent);
        
        // selectedManagementEventを更新
        setSelectedManagementEvent(updatedEvent);
        
        console.log('🔵 新しいトランザクションが追加されました:', newLog);
      }
    }
    
    // モーダルを閉じて状態をリセット
    setIsSOSOEditModalOpen(false);
    setSelectedMemberForEdit(null);
    
    // 編集元に応じて処理を分岐
    if (editSource === 'management') {
      console.log('🔵 SOSOManagementModalに戻ります');
      console.log('🔵 selectedManagementEvent:', selectedManagementEvent);
      
      // SOSOManagementModalに戻る
      setTimeout(() => {
        setIsManagementModalOpen(true);
      }, 100);
    }
    // editSource === 'sidebar' の場合は何もしない（メインページに戻る）
    
    setEditSource(null);
  };

  // handleEventClick関数を修正
  const handleEventClick = (clickInfo: any) => {
    console.log('clickInfo:', clickInfo);
    console.log('🔴 イベントがクリックされました!');
    
    const eventId = clickInfo.event.id;
    if (eventId) {
      console.log('🟢 eventIdが存在します:', eventId);
      
      const eventMembers = clickInfo.event.extendedProps?.members || [];
      const participatingMembers = members.filter(member => 
        eventMembers.includes(member.username)
      );
      
      console.log('🟢 参加メンバー:', participatingMembers);
      
      // ✅ イベントの日付と今日の日付を比較
      const eventDate = new Date(clickInfo.event.startStr.split('T')[0]); // イベントの日付
      const today = new Date(); // 今日の日付
      today.setHours(0, 0, 0, 0); // 時間を00:00:00にリセット
      eventDate.setHours(0, 0, 0, 0); // 時間を00:00:00にリセット
      
      console.log('🟢 イベント日付:', eventDate);
      console.log('🟢 今日の日付:', today);
      console.log('🟢 日付比較結果:', eventDate < today ? '過去' : '未来または今日');
      
      const eventProps: EventProps = {
        id: eventId,
        title: clickInfo.event.title || '',
        start: clickInfo.event.startStr || '',
        end: clickInfo.event.endStr || '',
        extendedProps: {
          ...clickInfo.event.extendedProps,
          participatingMembers: participatingMembers,
          eventLogs: eventLogs[eventId] || [] // イベント固有のログを追加
        }
      };
      
      // ✅ 日付比較に基づいてモーダルを選択
      if (eventDate < today) {
        // 過去のイベント → EventDetailModalを開く
        console.log('🔵 過去のイベントです。EventDetailModalを開きます。');
        setIsEventDetailModalOpen(true);
        setEventDetailData({
          id: eventId,
          date: clickInfo.event.startStr.split('T')[0] || '',
          title: clickInfo.event.title || '',
          details: clickInfo.event.extendedProps?.details || '',
          dropOffTime: clickInfo.event.startStr || '',
          pickUpTime: clickInfo.event.endStr || '',
          dropOffCount: clickInfo.event.extendedProps?.dropOffCount || 0,
          pickUpCount: clickInfo.event.extendedProps?.pickUpCount || 0,
          departurePoint: clickInfo.event.extendedProps?.departurePoint || '',
          destinationPoint: clickInfo.event.extendedProps?.destinationPoint || '',
          members: clickInfo.event.extendedProps?.members || [],
          eventURL: clickInfo.event.extendedProps?.eventURL,
          dispatchRegistered: clickInfo.event.extendedProps?.dispatchRegistered || [],
        });
      } else {
        // 今日または未来のイベント → SOSOManagementModalを開く
        console.log('🔵 今日または未来のイベントです。SOSOManagementModalを開きます。');
        setSelectedManagementEvent(eventProps);
        setIsManagementModalOpen(true);
      }
    } else {
      console.error("🔴 Clicked event has no ID.");
    }
  };

  const handleAddEventClick = (e: React.MouseEvent, arg: any) => {
    console.log("🔵 handleAddEventClickが実行されました。");
    e.stopPropagation();

    const tempDate = new Date(arg.date);
    tempDate.setDate(tempDate.getDate() + 1);
    const clickedDate = tempDate.toISOString().split('T')[0];
    console.log('🔵 clickedDate:クリックしたぜい', clickedDate);

    setSelectedDate(clickedDate);
    setIsAddModalOpen(true);
  };

  const handleLogout = () => {
    console.log("🔵 ログアウトが実行されました。");
    localStorage.removeItem('access_token');
    router.push('../');
    alert('ログアウトしました');
  };

  const handleLogoClick = () => {
    console.log("🔵 ロゴがクリックされました。");
    router.push('/calendarList');
  };

  const handleEditMember = (member: Member) => {
    console.log("🔵 メンバー編集がクリックされました:", member);
    setEditSource('sidebar');
    setSelectedMemberForEdit(member);
    setIsSOSOEditModalOpen(true);
  };

  // モーダルを閉じる関数
  const handleCloseSOSOEditModal = () => {
    setIsSOSOEditModalOpen(false);
    setSelectedMemberForEdit(null);
  };

  console.log('🟢 DashboardPageがレンダリングされました。'); 
  console.log('🟢 isManagementModalOpen:', isManagementModalOpen);
  console.log('🟢 selectedManagementEvent:', selectedManagementEvent);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <CalendarHeader
        pageTitle={decodedTitle}
        onLogout={handleLogout}
        onClickLogo={handleLogoClick}
        calendarUrl={`https://example.com/dashboard/share/${nameState}`}
      />
      <div className="flex flex-grow overflow-hidden">
        <CalendarLeftSidebar members={members} onEditMember={handleEditMember} className="h-full" />
        <main className="flex-grow p-6 overflow-y-auto">
          <div className="p-4 bg-white rounded-lg shadow">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={jaLocale}
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }}
              events={events}
              eventClick={handleEventClick}
              dayCellContent={(arg) => (
                <div className="relative w-full h-full">
                  <div className="absolute top-0 right-[63px] text-sm text-gray-800 pointer-events-none z-10">
                    {arg.dayNumberText.replace('日', '')}
                  </div>
                  <button
                    onClick={(e) => handleAddEventClick(e, arg)}
                    className="absolute top-0 right-2 text-black text-base font-bold hover:opacity-70 hover:scale-105 transition-transform"
                    aria-label="予定を追加"
                  >
                    +
                  </button>
                </div>
              )}
              eventContent={(arg) => {
                const startTime = arg.event.start
                  ? new Date(arg.event.start).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div className="flex items-center space-x-2 text-xs text-gray-800 truncate">
                    {/* 青い丸 */}
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />

                    {/* 時刻とタイトル */}
                    <div>
                      <span className="font-medium">{startTime}</span>{' '}
                      <span>{arg.event.title}</span>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </main>
        <CalendarRightSidebar logs={logs} className="h-full" />
      </div>

      {/* --- ▼▼▼ モーダル領域 ▼▼▼ --- */}
      {isAddModalOpen && (
        <EventAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveNewEvent}
          initialStatus={{ ...initialEventStatus, date: selectedDate }}
        />
      )}
      {selectedManagementEvent && (
        <SOSOManagementModal
          isOpen={isManagementModalOpen}
          onClose={() => {
            console.log('🔴 SOSOManagementModalを閉じます');
            setIsManagementModalOpen(false);
            setSelectedManagementEvent(null); // ここでのみnullにする
          }}
          initialData={selectedManagementEvent}
          onSave={handleSaveManagement}
          allMembers={members}
        />
      )}

      {/* SOSO編集モーダル */}
      {selectedMemberForEdit && (
        <SOSOEditModal
          isOpen={isSOSOEditModalOpen}
          onClose={handleCloseSOSOEditModal}
          onSave={handleSaveSosoChange}
          initialData={selectedMemberForEdit}
        />
      )}

      {isEventDetailModalOpen && eventDetailData && (
        <EventDetailModal
          isOpen={isEventDetailModalOpen}
          onClose={() => setIsEventDetailModalOpen(false)}
          eventData={eventDetailData}
        />
      )}
    </div>
  );
}