'use client';

import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/navigation';

// 必要なコンポーネントをインポート
import CalendarHeader from '@/src/components/Headers/CalendarHeader';
import CalendarLeftSidebar from '@/src/components/Sidebar/CalendarSidebar';
import CalendarRightSidebar from '@/src/components/Sidebar/CalendarRightSidebar';
import SOSOEditModal from '@/src/components/Modal/SOSOEditModal';

// サイドバーで必要となるデータの型をインポート
import { Member } from '@/src/components/MemberList/MenberList';
import { SOSOTransaction } from '@/src/components/SOSOList/SOSOList';

// モーダルが返すデータの型
interface EditedMemberData extends Member {
  reason: string;
}

// ページのPropsの型定義
interface DashboardPageProps {
  params: {
    name: string;
  };
}

// ページ本体のコンポーネント
const DashboardPage: NextPage<DashboardPageProps> = ({ params }) => {
  const router = useRouter();
  const { name } = params;
  const decodedTitle = decodeURIComponent(name);

  // --- ▼▼▼ State管理 ▼▼▼ ---

  const [members, setMembers] = useState<Member[]>([
    { id: 1, memberName: '佐藤 健太', hasCar: true, passengerNumber: 4, sosoPoint: 150 },
    { id: 2, memberName: '鈴木 陽子', hasCar: false, sosoPoint: 50 },
    { id: 3, memberName: '高橋 一郎', hasCar: false, sosoPoint: 80 },
    { id: 4, memberName: '伊藤 花子', hasCar: true, passengerNumber: 6, sosoPoint: 200 },
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
    if (selectedMember) { // ★★★ 修正点1: `editedData.reason`のチェックを削除
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
          // ★★★ 修正点2: 理由が空の場合、代替テキストを表示
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
          <p className="mt-2 text-gray-600">
            ここにカレンダー本体やイベント一覧が表示されます。
          </p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            
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
    </div>
  );
};

export default DashboardPage;