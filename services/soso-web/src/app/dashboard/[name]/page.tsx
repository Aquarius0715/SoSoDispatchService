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
import SOSOEditModal from '@/src/components/Modal/SOSOEditModal';
import EventAddModal from '@/src/components/Modal/EventAddModal';

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

// ページ本体のコンポーネント
const DashboardPage: NextPage<DashboardPageProps> = ({ params }) => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [decodedTitle, setDecodedTitle] = useState<string>('');

  // paramsを非同期で処理
  useEffect(() => {
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // ▼ イベントクリック時の処理
  const handleEventClick = (clickInfo: any) => {
    // クリックされたイベントの情報をStateに保存
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
    });
    // 編集モーダルを開く
    setIsEditModalOpen(true);
  };

  // ▼ プラスボタンクリック時の処理
  const handleAddEventClick = (e: React.MouseEvent, arg: any) => {
    // 親要素のdateClickイベントが発火するのを防ぐ
    e.stopPropagation(); 

    // クリックされた日付をStateに保存
    setSelectedDate(arg.dateStr);
    
    // 新規追加モーダルを開く
    setIsAddModalOpen(true);
  };

  // --- ▼▼▼ State管理 ▼▼▼ ---

  const [members, setMembers] = useState<Member[]>([
    { id: 1, memberName: '佐藤 健太', hasCar: true, seatsRequired: 4, sosoPoint: 150 },
    { id: 2, memberName: '鈴木 陽子', hasCar: false, sosoPoint: 50 },
    { id: 3, memberName: '高橋 一郎', hasCar: false, sosoPoint: 80 },
    { id: 4, memberName: '伊藤 花子', hasCar: true, seatsRequired: 6, sosoPoint: 200 },
  ]);

  const [logs, setLogs] = useState<SOSOTransaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // --- ▼▼▼ ハンドラ関数 ▼▼▼ ---

  const handleLogout = () => {
    router.push('/');
    alert('ログアウトしました');
  };

  const handleLogoClick = () => {
    router.push('/mypage');
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleSaveSosoChange = (editedData: EditedMemberData) => {
    // 1. メンバーリスト内のポイントを更新
    setMembers(currentMembers =>
      currentMembers.map(member =>
        member.id === editedData.id
          ? { ...member, sosoPoint: editedData.sosoPoint }
          : member
      )
    );

    // 2. ポイント変動履歴に新しいログを追加
    if (selectedMember) {
      const pointChange = editedData.sosoPoint - selectedMember.sosoPoint;
      
      // ポイントに変動があった場合のみログを追加
      if (pointChange !== 0) {
        const newLog: SOSOTransaction = {
          id: Date.now(),
          eventName: '手動調整',
          date: new Date().toLocaleDateString('ja-JP'),
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          changer: '管理者',
          changee: editedData.memberName,
          sosoPoints: pointChange,
          reason: editedData.reason || '（理由の記載なし）',
        };
        setLogs(prevLogs => [newLog, ...prevLogs]);
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      
      {/* 1. ヘッダーの配置 */}
      <CalendarHeader
        pageTitle={decodedTitle}
        onLogout={handleLogout}
        onClickLogo={handleLogoClick}
        calendarUrl={`https://example.com/dashboard/share/${name}`}
      />

      {/* ヘッダー以外の全領域 */}
      <div className="flex flex-grow overflow-hidden">

        {/* 2. 左サイドバーの配置 */}
        <CalendarLeftSidebar
          members={members}
          onEditMember={handleEditMember}
          className="h-full"
        />

        {/* 3. メインコンテンツエリア */}
        <main className="flex-grow p-6 overflow-y-auto">
         {/* ここにカレンダーを設置 */}
          <div className="p-4 bg-white rounded-lg shadow">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ja" // jaLocaleではなく文字列として指定
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }} 
              events={events}
              eventClick={handleEventClick}
              dayCellContent={(arg) => (
                <div className="relative w-full h-full">
                  <div className="absolute top-0 right-15 text-sm text-gray-800 pointer-events-none z-10">
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
                  <div className="mt-2 flex items-center space-x-2 text-xs text-gray-800 truncate">
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

        {/* 4. 右サイドバーの配置 */}
        <CalendarRightSidebar
          logs={logs}
          className="h-full"
        />
      </div>

      {/* モーダルはselectedMemberが存在する場合のみレンダリング */}
      {selectedMember && (
        <SOSOEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSosoChange}
          initialData={selectedMember}
        />
      )}

      {isAddModalOpen && (
  <EventAddModal
    isOpen={isAddModalOpen}
    onClose={() => setIsAddModalOpen(false)}
    onSave={(status) => {
      const newEvent: EventInput = {
        id: Date.now().toString(),
        title: status.title,
        start: selectedDate + 'T' + status.pickUpTime,
        end: selectedDate + 'T' + status.dropOffTime,
      };
      setEvents(prev => [...prev, newEvent]);
      setIsAddModalOpen(false);
    }}
    initialStatus={{
      title: '',
      details: '',
      dropOffTime: '10:00',
      pickUpTime: '09:00',
      dropOffCount: 0,
      pickUpCount: 0,
      departurePoint: '',
      destinationPoint: '',
      members: [],
    }}
  />
)}
    </div>
  );
};

export default DashboardPage;