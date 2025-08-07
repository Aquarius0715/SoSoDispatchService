'use client';


import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/navigation';
// import React, { use } from 'react'; 
// 必要なコンポーネントをインポート
import CalendarHeader from '@/src/components/Headers/CalendarHeader';
import CalendarLeftSidebar from '@/src/components/Sidebar/CalendarSidebar';
import CalendarRightSidebar from '@/src/components/Sidebar/CalendarRightSidebar';
import { EventInput } from '@fullcalendar/core';
//カレンダー用インポート
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja'; // 日本語化

// サイドバーで必要となるデータの型をインポート
// パスは実際のプロジェクトに合わせて調整してください
import { Member } from '@/src/components/MemberList/MenberList';
import { SOSOTransaction } from '@/src/components/SOSOList/SOSOList';

// ページのPropsの型定義
interface DashboardPageProps {
  params: {
    name: string; // URLから受け取るカレンダー名
  };
}

// ページ本体のコンポーネント
const DashboardPage: NextPage<DashboardPageProps> = ({ params }) => {
  const router = useRouter();
  const { name } = params;
  const decodedTitle = decodeURIComponent(name);
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

  // --- ▼▼▼ ここからダミーデータとハンドラ関数 ▼▼▼ ---
  // 本来はAPIなどから取得しますが、UI表示用に仮のデータを用意します。

  // 左サイドバーに渡すメンバーリストのダミーデータ
  const dummyMembers: Member[] = [
    // 修正点: `name` `role` `soso` -> `memberName` `hasCar` `passengerNumber` `sosoPoint`
    { id: 1, memberName: '佐藤 健太', hasCar: true, passengerNumber: 4, sosoPoint: 150 },
    { id: 2, memberName: '鈴木 陽子', hasCar: false, sosoPoint: 50 },
    { id: 3, memberName: '高橋 一郎', hasCar: false, sosoPoint: 80 },
    { id: 4, memberName: '伊藤 花子', hasCar: true, passengerNumber: 6, sosoPoint: 200 },
  ];

  // 右サイドバーに渡すSOSOポイント履歴のダミーデータ
  const dummyLogs: SOSOTransaction[] = [
    // 修正点: 新しいSOSOTransaction型に合わせてプロパティを全面的に変更
    {
      id: 1,
      eventName: '新歓コンパ',
      date: '2024/07/15',
      time: '19:00',
      changer: '佐藤 健太',
      changee: 'システム',
      sosoPoints: 10,
      reason: '新歓コンパでの運転協力',
    },
    {
      id: 2,
      eventName: 'ライブ打ち上げ',
      date: '2024/07/12',
      time: '21:30',
      changer: 'システム',
      changee: '伊藤 花子',
      sosoPoints: -5,
      reason: 'ガソリン代精算',
    },
    {
      id: 3,
    eventName: 'ゼミ歓迎会',
      date: '2024/07/10',
      time: '18:00',
      changer: '高橋 一郎',
      changee: '佐藤 健太',
      sosoPoints: 5,
      reason: '買い出し協力のお礼',
    },
  ];

  // ヘッダーに渡すためのハンドラ関数
  const handleLogout = () => {
    router.push('/');
    alert('ログアウトしました');
  };
  const handleLogoClick = () => {
    router.push('/mypage'); // ロゴクリックでマイページに移動するなど
  };

  //左サイドバーに渡すためのハンドラ関数
  const handleEditMember = (member: Member) => {
    alert(`${member.memberName}さんを編集します`);
    // ここで実際に編集モーダルを開く処理を実装
  };

  // --- ▲▲▲ ここまでダミーデータとハンドラ関数 ▲▲▲ ---

  return (
    // ページ全体のレイアウト
    <div className="flex flex-col h-screen bg-gray-100">
      
      {/* 1. ヘッダーの配置 */}
      <div> 
        <CalendarHeader
          pageTitle={decodedTitle}
          onLogout={handleLogout}
          onClickLogo={handleLogoClick}
          calendarUrl={`https://example.com/dashboard/share/${name}`} // 仮の共有URL
        />
      </div>

      {/* ヘッダー以外の全領域 */}
      <div className="flex flex-grow overflow-hidden">

        {/* 2. 左サイドバーの配置 */}
        <CalendarLeftSidebar
          members={dummyMembers}
          onEditMember={handleEditMember}
          className="h-full" // 高さを親要素に合わせる
        />

        {/* 3. メインコンテンツエリア */}
        <main className="flex-grow p-6 overflow-y-auto">
         {/* ここにカレンダーを設置 */}
          <div className="p-4 bg-white rounded-lg shadow">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]} // プラグインを読み込む
              initialView="dayGridMonth" // 表示形式を「月」に設定
              locale={jaLocale} // 言語を日本語に設定
              headerToolbar={{ // ヘッダーのボタン設定
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek' // 将来的に週表示も追加可能
              }} 
              events={events} // 表示するイベントデータを渡す
              eventClick={handleEventClick} // ★ 既存イベントのクリック処理
              dayCellContent={(arg) => (
    // 親コンテナを相対位置(relative)の基準にする
    <div className="relative h-full w-full">
      {/* 日付の数字 (左上へ絶対配置) */}
      <span className="absolute top-1 left-1 text-sm text-gray-800">
        {arg.dayNumberText.replace('日', '')}
      </span>
      
      {/* プラスボタン (右上へ絶対配置) */}
      <button 
        onClick={(e) => handleAddEventClick(e, arg)}
        className="absolute top-1 right-1 text-black text-xl font-bold hover:opacity-70"
        aria-label="予定を追加"
      >
        +
      </button>
    </div>
  )}
            />
          </div>
        </main>

        {/* 4. 右サイドバーの配置 */}
        <CalendarRightSidebar
          logs={dummyLogs}
          className="h-full" // 高さを親要素に合わせる
        />
      </div>
    </div>
  );
};

export default DashboardPage;