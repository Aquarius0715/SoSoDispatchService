'use client';

import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/navigation';

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

// サイドバーで必要となるデータの型をインポート
import { Member } from '@/src/components/MemberList/MenberList';
import { SOSOTransaction } from '@/src/components/SOSOList/SOSOList';

// モーダルが返すデータの型
interface EditedMemberData extends Member {
  reason: string;
}

// ページのPropsの型定義をNext.js 15に対応
interface DashboardPageProps {
  params: Promise<{
    name: string;
  }>;
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

// ページ本体のコンポーネント
const DashboardPage: NextPage<DashboardPageProps> = ({ params }) => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [decodedTitle, setDecodedTitle] = useState<string>('');
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [selectedManagementEvent, setSelectedManagementEvent] = useState<EventProps | null>(null);


  // paramsを非同期で処理
  useEffect(() => {
    console.log("🟡 useEffect: paramsが変更されました。");
    const resolveParams = async () => {
      const resolvedParams = await params;
      setName(resolvedParams.name);
      setDecodedTitle(decodeURIComponent(resolvedParams.name));
    };
    resolveParams();
  }, [params]);

  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: 'チームミーティング', start: '2025-08-11T10:30:00', end: '2025-08-11T12:00:00' },
  ]);

  // ▼ モーダル管理用のState（例）
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // ▼ 新規イベント追加時の初期ステータス
  const initialEventStatus: EventStatus = {
    date: '',
    title: '',
    details: '',
    dropOffTime: '',
    pickUpTime: '',
    dropOffCount: 0,
    pickUpCount: 0,
    departurePoint: '',
    destinationPoint: '',
    members: []
  };

  // page.tsx
// ▼ 新規イベント保存時の処理
const handleSaveNewEvent = (eventData: EventStatus) => {
  console.log("🔵 handleSaveNewEventが実行されました。");
  // 開始時刻と終了時刻を作成（送り時刻を使用）
  const startDateTime = eventData.dropOffTime 
    ? `${eventData.date}T${eventData.dropOffTime}:00`
    : `${eventData.date}T09:00:00`; // デフォルト時刻
  
  const endDateTime = eventData.pickUpTime 
    ? `${eventData.date}T${eventData.pickUpTime}:00`
    : `${eventData.date}T10:00:00`; // デフォルト時刻（1時間後）

  // 新しいイベントを作成
  const newEvent: EventInput = {
    id: Date.now().toString(),
    title: eventData.title,
    start: startDateTime,
    end: endDateTime,
    // カスタムプロパティも追加可能
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

  // eventsステートに新しいイベントを追加
  setEvents(prevEvents => [...prevEvents, newEvent]);
  
  // モーダルを閉じる
  setIsAddModalOpen(false);
  
  console.log('🔵 新しいイベントが追加されました:', newEvent);
};


const handleSaveManagement = (eventData: any) => {
  console.log("🔵 handleSaveManagementが実行されました。");
  // イベント管理の保存処理を実装
  console.log('🔵 Management data saved:', eventData);
  setIsManagementModalOpen(false);
};



// page.tsx のhandleEventClick関数を修正
const handleEventClick = (clickInfo: any) => {
  console.log('clickInfo:', clickInfo);
  console.log('🔴 イベントがクリックされました!');
  console.log('🔴 clickInfo.event:', clickInfo.event);
  console.log('🔴 clickInfo.event.id:', clickInfo.event.id);
  console.log('🔴 clickInfo.event.title:', clickInfo.event.title);
  
  const eventId = clickInfo.event.id;
  if (eventId) {
    console.log('🟢 eventIdが存在します:', eventId);
    
    const eventProps: EventProps = {
      id: eventId,
      title: clickInfo.event.title || '',
      start: clickInfo.event.startStr || '',
      end: clickInfo.event.endStr || '',
      extendedProps: clickInfo.event.extendedProps || {},
    };
    
    console.log('🟢 作成されたeventProps:', eventProps);
    
    setSelectedManagementEvent(eventProps);
    console.log('🟢 setSelectedManagementEvent実行完了');
    
    setIsManagementModalOpen(true);
    console.log('🟢 setIsManagementModalOpen(true)実行完了');
  } else {
    console.error("🔴 Clicked event has no ID.");
  }
};

// ▼ プラスボタンクリック時の処理
const handleAddEventClick = (e: React.MouseEvent, arg: any) => {
  console.log("🔵 handleAddEventClickが実行されました。");
  // 親要素のdateClickイベントが発火するのを防ぐ
  e.stopPropagation();

    // arg.dateを直接変更せず、新しいDateオブジェクトを作成して操作する
  const tempDate = new Date(arg.date); // 新しいDateオブジェクトを作成
  tempDate.setDate(tempDate.getDate() + 1);
  const clickedDate = tempDate.toISOString().split('T')[0];
  console.log('🔵 clickedDate:クリックしたぜい', clickedDate); // これを追加

    // 選択された日付をStateに保存

  setSelectedDate(clickedDate);
  // console.log('arg.dateオブジェクト:', arg.date); // これを追加
  // console.log('arg.dateのtoString():', arg.date.toString()); // ローカルタイム表示
  // console.log('arg.dateのtoISOString():', arg.date.toISOString()); // UTC表示

    // 新規追加モーダルを開く
    setIsAddModalOpen(true);
  };

  // --- ▼▼▼ State管理 ▼▼▼ ---

  const [members, setMembers] = useState<Member[]>([
    { id: 1, username: '佐藤 健太', hasCar: true, seatsRequired: 4, sosoPoint: 150 },
    { id: 2, username: '鈴木 陽子', hasCar: false, sosoPoint: 50 },
    { id: 3, username: '高橋 一郎', hasCar: false, sosoPoint: 80 },
    { id: 4, username: '伊藤 花子', hasCar: true, seatsRequired: 6, sosoPoint: 200 },
  ]);
  const [logs, setLogs] = useState<SOSOTransaction[]>([]);
  const [isSosoModalOpen, setIsSosoModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // --- ▼▼▼ ハンドラ関数 ▼▼▼ ---

  const handleLogout = () => {
    console.log("🔵 ログアウトが実行されました。");
    router.push('/');
    alert('ログアウトしました');
  };

  const handleLogoClick = () => {
    console.log("🔵 ロゴがクリックされました。");
    router.push('/mypage');
  };

  const handleEditMember = (member: Member) => {
    console.log("🔵 メンバー編集がクリックされました:", member);
    setSelectedMember(member);
    setIsSosoModalOpen(true);
  };

  const handleSaveSosoChange = (editedData: EditedMemberData): void => {
    console.log("🔵 handleSaveSosoChangeが実行されました。");
    // 1. メンバーのSOSOポイントを更新
    setMembers(currentMembers =>
      currentMembers.map(member =>
        member.id === editedData.id ? { ...member, sosoPoint: editedData.sosoPoint } : member
      )
    );
    
    // 2. ポイント変動履歴に新しいログを追加
    if (selectedMember) {
      const pointChange = editedData.sosoPoint - selectedMember.sosoPoint;
      if (pointChange !== 0) {
        const newLog: SOSOTransaction = {
          id: Date.now(),
          eventName: '手動調整',
          dateTime: new Date().toISOString(),
          changer: '管理者',
          changee: editedData.username,
          sosoPoints: pointChange,
          reason: editedData.reason || '（理由の記載なし）',
        };
        setLogs(prevLogs => [newLog, ...prevLogs]);
      }
    }
    
    // 3. モーダルを閉じる
    setIsSosoModalOpen(false);
  };
  console.log('🟢 DashboardPageがレンダリングされました。'); 
  console.log('🟢 isManagementModalOpen:', isManagementModalOpen);
  console.log('🟢 selectedManagementEvent:', selectedManagementEvent);
  console.log('現在のイベント配列:', events); 

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <CalendarHeader
        pageTitle={decodedTitle}
        onLogout={handleLogout}
        onClickLogo={handleLogoClick}
        calendarUrl={`https://example.com/dashboard/share/${name}`}
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
              <div className="relative h-full w-full pointer-events-none">
                <span className="absolute top-1 right-20 text-sm text-gray-800">
                  {arg.dayNumberText.replace('日', '')}
                </span>
                <button
                  onClick={(e) => handleAddEventClick(e, arg)}
                  className="absolute top-[-6px] right-1 text-gray-400 hover:bg-gray-200 rounded-full p-2 pointer-events-auto"
                  aria-label="予定を追加"
                >
                  +
                </button>
              </div>
            )}
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
          onClose={() => setIsManagementModalOpen(false)}
          initialData={selectedManagementEvent} // <-- ここでselectedManagementEventを渡す
          onSave={handleSaveManagement} // <-- 保存処理を実装する関数
        />
      )}


    </div>
  );
};

export default DashboardPage;