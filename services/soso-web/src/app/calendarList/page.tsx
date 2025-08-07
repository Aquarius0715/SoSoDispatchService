'use client';

import React, { useState } from 'react';
import MyPageHeader from '@/src/components/Headers/MyPageHeader';
import MyPageLeftSidebar from '@/src/components/Sidebar/MyPageLeftSidebar';
import MyPageRightSidebar from '@/src/components/Sidebar/MyPageRightSidebar';
import { Drive, DriveState } from '@/src/components/DriverList/DriverList';
import Button from '@/src/components/Button/Button';
import clsx from 'clsx';
import StatusEditModal from '@/src/components/Modal/StatusEditModal';
import { useRouter } from 'next/navigation';
import TeamAddModal from '@/src/components/Modal/TeamAddModal';


export interface CalendarEntry {
  id: number | string;
  name: string;
}

// ユーザー情報の型定義を再利用
interface UserStatus {
    userName: string;
    email: string;
    hasCar: boolean;
    capacity: number;
}

interface calendarAddProps {
  calendarName: string;
}

export default function MyPage() {
  const router = useRouter();
// モーダルの表示状態を管理するステート
  const [isStatusEditModalOpen, setIsStatusEditModalOpen] = useState(false);
  const [isTeamAddModalOpen, setIsTeamAddModalOpen] = useState(false);

  // ユーザー情報のステートを追加
  const [userStatus, setUserStatus] = useState<UserStatus>({ // ★ UserStatus型を指定
    userName: '田中 太郎',
    email: 'tanaka.taro@example.com',
    hasCar: true,
    capacity: 3,
  });

  const [calendars, setCalendars] = useState<CalendarEntry[]>([
    { id: 1, name: 'テニスサークル' },
    { id: 2, name: '軽音学部' },
    { id: 3, name: 'ゼミ' },
    { id: 4, name: 'バイト仲間' },
  ]);

  const drives: Drive[] = [
    {
      id: 1,
      calendarName: 'テニスサークル',
      eventName: '新歓コンパ',
      driveState: DriveState.PICK_UP,
      eventDate: '2024/04/15',
      driveTime: '18:00',
      passengerNumber: 3,
    },
    {
      id: 2,
      calendarName: '軽音学部',
      eventName: 'ライブ打ち上げ',
      driveState: DriveState.DROP_OFF,
      eventDate: '2024/04/20',
      driveTime: '21:00',
      passengerNumber: 2,
    },
    {
      id: 3,
      calendarName: 'ゼミ',
      eventName: '歓迎会',
      driveState: DriveState.PICK_UP,
      eventDate: '2024/04/25',
      driveTime: '19:00',
      passengerNumber: 4,
    },
  ];

  const handleLogout = () => {
    router.push('../');
    alert('ログアウトしました');
  };

  const handleEditStatus = () => {
    setIsStatusEditModalOpen(true);
  };

  const handleLogoClick = () => {
    alert('ロゴがクリックされました');
  };

  const onCalendarClick = (name: string) => {
    router.push('/dashboard/' + name);
    alert(`カレンダーID: ${name} がクリックされました`);
  };
  // const onCalendarClick = (id: number | string) => {
  //   router.push('../calendar/' + id);
  //   alert(`カレンダーID: ${id} がクリックされました`);
  // };
  


  const handleAddCalendar = () => {
    setIsTeamAddModalOpen(true);
  };

  // onSaveに渡す関数
  // この関数が、モーダルからの編集内容を受け取る
  // ★ ここを修正
  const handleSaveStatus = (newStatus: UserStatus): void => {
    setUserStatus(newStatus); // ユーザー情報を更新
    setIsStatusEditModalOpen(false); // モーダルを閉じる
  };

  const handleSaveAddCalendar = (newCalendar: calendarAddProps): void => {
    const newEntry: CalendarEntry = {
      id: calendars.length + 1,
      name: newCalendar.calendarName,
    };
    setCalendars([...calendars, newEntry]);
    setIsTeamAddModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <MyPageHeader
        pageTitle="マイページ"
        onLogout={handleLogout}
        onClickLogo={handleLogoClick}
      />
      <div className="flex flex-grow overflow-hidden">
        <MyPageLeftSidebar
          userName={userStatus.userName} // ★ userStatusから値を取得
          hasCar={userStatus.hasCar}     // ★ userStatusから値を取得
          passengerNumber={userStatus.capacity} // ★ userStatusから値を取得
          onEditClick={handleEditStatus}
          email={userStatus.email} // ★ userStatusから値を取得
        />
        <main className={clsx("flex-grow p-8 overflow-y-auto")}>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">参加しているカレンダー一覧</h2>
          <div className="flex flex-wrap gap-4">
            {calendars.map((calendar) => (
              <Button
                key={calendar.id}
                onClick={() => onCalendarClick(calendar.name)} // ★ calendar.idからcalendar.nameに変更
                className="p-4 bg-white rounded-lg shadow-md border border-gray-200 text-gray-800 hover:bg-gray-100"
              >
                <p className="font-semibold">{calendar.name}</p>
              </Button>
            ))}
          </div>
          {!isTeamAddModalOpen && (
                <Button
                variant="circle"
                onClick={handleAddCalendar}
                className="fixed bottom-8 right-80 z-50"
                >
                <span className="text-2xl">+</span>
                </Button>
            )}
        </main>
        <MyPageRightSidebar drives={drives} />
      </div>

      <StatusEditModal
        isOpen={isStatusEditModalOpen}
        onClose={() => setIsStatusEditModalOpen(false)}
        onSave={handleSaveStatus}
        initialStatus={userStatus}
      />

      <TeamAddModal
        isOpen={isTeamAddModalOpen}
        onClose={() => setIsTeamAddModalOpen(false)}
        onSave={handleSaveAddCalendar}
      />
    </div>
  );
}