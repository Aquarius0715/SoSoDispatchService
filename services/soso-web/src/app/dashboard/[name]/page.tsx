'use client';

import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/navigation';
// import React, { use } from 'react'; 
// 必要なコンポーネントをインポート
import CalendarHeader from '@/src/components/Headers/CalendarHeader';
import CalendarLeftSidebar from '@/src/components/Sidebar/CalendarSidebar';
import CalendarRightSidebar from '@/src/components/Sidebar/CalendarRightSidebar';

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
          <p className="mt-2 text-gray-600">
            ここにカレンダー本体やイベント一覧が表示されます。
          </p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            
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