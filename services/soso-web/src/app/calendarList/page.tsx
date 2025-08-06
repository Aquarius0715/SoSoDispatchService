'use client';

import React, { useState } from 'react';
import MyPageHeader from '@/src/components/Headers/MyPageHeader';
import MyPageLeftSidebar from '@/src/components/Sidebar/MyPageLeftSidebar';
import MyPageRightSidebar from '@/src/components/Sidebar/MyPageRightSidebar';
import { Drive, DriveState } from '@/src/components/DriverList/DriverList'; // DriveStateも追加でインポート
import Button from '@/src/components/Button/Button';
import clsx from 'clsx';

export interface CalendarEntry {
  id: number | string;
  name: string;
}

export default function MyPage() {
  const [calendars, setCalendars] = useState<CalendarEntry[]>([
    { id: 1, name: 'テニスサークル' },
    { id: 2, name: '軽音学部' },
    { id: 3, name: 'ゼミ' },
    { id: 4, name: 'バイト仲間' },
  ]);

  const drives: Drive[] = [
    {
      id: 1,
      calenderName: 'テニスサークル',
      eventName: '新歓コンパ',
      driveState: DriveState.PICK_UP,
      eventDate: '2024/04/15',
      driveTime: '18:00',
      passengerNumber: 3,
    },
    {
      id: 2,
      calenderName: '軽音学部',
      eventName: 'ライブ打ち上げ',
      driveState: DriveState.DROP_OFF,
      eventDate: '2024/04/20',
      driveTime: '21:00',
      passengerNumber: 2,
    },
    {
      id: 3,
      calenderName: 'ゼミ',
      eventName: '歓迎会',
      driveState: DriveState.PICK_UP,
      eventDate: '2024/04/25',
      driveTime: '19:00',
      passengerNumber: 4,
    },
  ];

  const handleLogout = () => {
    alert('ログアウトしました');
  };

  const handleEditStatus = () => {
    alert('ステータスを編集します');
  };

  const handleLogoClick = () => {
    alert('ロゴがクリックされました');
  };

  const onCalendarClick = (id: number | string) => {
    alert(`カレンダーID: ${id} がクリックされました`);
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
          userName="田中 太郎"
          hasCar={true}
          passengerNumber={3}
          onEditClick={handleEditStatus}
        />
        <main className={clsx("flex-grow p-8 overflow-y-auto")}>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">参加しているカレンダー一覧</h2>
          <div className="flex flex-wrap gap-4">
            {calendars.map((calendar) => (
              <Button
                key={calendar.id}
                onClick={() => onCalendarClick(calendar.id)}
                className="p-4 bg-white rounded-lg shadow-md border border-gray-200 text-gray-800 hover:bg-gray-100"
              >
                <p className="font-semibold">{calendar.name}</p>
              </Button>
            ))}
          </div>
        </main>
        <MyPageRightSidebar drives={drives} />
      </div>
    </div>
  );
}