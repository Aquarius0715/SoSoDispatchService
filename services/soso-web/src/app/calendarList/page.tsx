'use client';

import React, { useState, useEffect } from 'react';
import MyPageHeader from '@/src/components/Headers/MyPageHeader';
import MyPageLeftSidebar from '@/src/components/Sidebar/MyPageLeftSidebar';
import MyPageRightSidebar from '@/src/components/Sidebar/MyPageRightSidebar';
import { Drive, DriveState } from '@/src/components/DriverList/DriverList';
import Button from '@/src/components/Button/Button';
import clsx from 'clsx';
import StatusEditModal from '@/src/components/Modal/StatusEditModal';
import { useRouter } from 'next/navigation';
import TeamAddModal from '@/src/components/Modal/TeamAddModal';
import Cookies from 'js-cookie';
export interface CalendarEntry {
  id: number | string;
  name: string;
}

// ユーザー情報の型定義
interface UserStatus {
  username: string;
  mailAddress: string;
  hasCar: boolean;
  capacity: number;
}

interface calendarAddProps {
  calendarName: string;
  reason?: string;
}

export default function MyPage() {
  const router = useRouter();
  const [isStatusEditModalOpen, setIsStatusEditModalOpen] = useState(false);
  const [isTeamAddModalOpen, setIsTeamAddModalOpen] = useState(false);
  const [isCreatingCalendar, setIsCreatingCalendar] = useState(false);

  // ユーザー情報のステート。初期値は空に設定
  const [userStatus, setUserStatus] = useState<UserStatus>({
    username: '読み込み中...',
    mailAddress: '',
    hasCar: false,
    capacity: 0,
  });

  const [calendars, setCalendars] = useState<CalendarEntry[]>([]);
  
  // ★ 追加: APIのベースURLを環境変数から取得
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  // ★ 修正: ユーザー情報を取得する関数
  const fetchUserStatus = async (token: string) => {
    if (!API_BASE) return;
    try {
      const csrfToken = Cookies.get('csrf_token')?.toString() ?? ""
      const response = await fetch(`${API_BASE}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken,
        },
      });
      if (!response.ok) {
        throw new Error(`ユーザー情報の取得に失敗しました (Status: ${response.status})`);
      }
      const data: UserStatus = await response.json();
      setUserStatus(data);
    } catch (error) {
      console.error('ユーザー情報の取得エラー:', error);
      // トークンが無効な場合などはログアウトさせる
      handleLogout();
    }
  };

  // ★ 修正: カレンダー一覧を取得する関数
  const fetchCalendars = async (token: string) => {
    if (!API_BASE) return;
    try {
      // const csrfToken = Cookies.get(`csrf_token`)?.toString ?? ""
      const csrfToken = Cookies.get('csrf_token')?.toString() ?? ""
      const response = await fetch(`${API_BASE}/calenders/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error(`カレンダーの取得に失敗しました (Status: ${response.status})`);
      }
      const data: CalendarEntry[] = await response.json();
      setCalendars(data);
    } catch (error) {
      console.error('カレンダーの取得エラー:', error);
    }
  };

  // ★ 修正: ページ読み込み時にlocalStorageからトークンを取得し、各種データを取得する
  useEffect(() => {
    // localStorageからアクセストークンを取得
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      console.error('アクセストークンがありません。ログインしてください。');
      router.push('../'); // ログインページへリダイレクト
      return;
    }

    // トークンを使ってユーザー情報とカレンダー情報を取得
    fetchUserStatus(accessToken);
    fetchCalendars(accessToken);
  }, [API_BASE, router]); // 依存配列にrouterを追加

  // モックデータ（表示確認用）
  const drives: Drive[] = [
    { id: 1, calendarName: 'テニスサークル', eventName: '新歓コンパ', driveState: DriveState.PICK_UP, eventDate: '2024/04/15', driveTime: '18:00', seatsRequired: 3 },
    { id: 2, calendarName: '軽音学部', eventName: 'ライブ打ち上げ', driveState: DriveState.DROP_OFF, eventDate: '2024/04/20', driveTime: '21:00', seatsRequired: 2 },
  ];

  // ★ 修正: ログアウト処理
  const handleLogout = () => {
    // localStorageからトークンを削除
    localStorage.removeItem('access_token');
    router.push('../');
    alert('ログアウトしました');
  };

  const handleEditStatus = () => {
    setIsStatusEditModalOpen(true);
  };

  const handleLogoClick = () => {
    alert('ロゴがクリックされました');
  };

  // ...existing code...

const onCalendarClick = (id: string) => {
  // ★ 修正: [id]/[slug] 構造に対応
  // calendar.name をエンコードして slug として使用
  const calendar = calendars.find(cal => cal.id.toString() === id);
  if (calendar) {
    const encodedName = encodeURIComponent(calendar.name);
    router.push(`/dashboard/${id}/${encodedName}`);
  } else {
    // フォールバック: calendar が見つからない場合はデフォルト名を使用
    router.push(`/dashboard/${id}/calendar`);
  }
};

// ...existing code...

  const handleAddCalendar = () => {
    setIsTeamAddModalOpen(true);
  };
  
  const handleSaveStatus = async (newStatus: UserStatus) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('認証エラー。再度ログインしてください。');
      return;
    }
    if (!API_BASE) return;

    try {
      const csrfToken = Cookies.get('csrf_token')?.toString() ?? "";
      // バックエンドのユーザー更新APIエンドポイントを呼び出す (例: PUT /users/me)
      const response = await fetch(`${API_BASE}/users/me`, {
        method: 'PATCH', // ★ 修正: 'PUT'から'PATCH'に変更
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(newStatus),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'サーバーエラー' }));
        throw new Error(errorData.message || `更新に失敗しました (Status: ${response.status})`);
      }

      // APIから返された最新のユーザー情報でStateを更新
      const updatedUser: UserStatus = await response.json();
      setUserStatus(updatedUser);

      // モーダルを閉じる
      setIsStatusEditModalOpen(false);
      alert('ステータスを更新しました。');

    } catch (error: any) {
      console.error('ステータスの更新エラー:', error);
      alert(`更新に失敗しました: ${error.message}`);
    }
  };

  // ★ 修正: カレンダー追加処理
  const handleSaveAddCalendar = async (newCalendar: calendarAddProps): Promise<void> => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('認証エラー。再度ログインしてください。');
      return;
    }
    if (!API_BASE) return;

    setIsCreatingCalendar(true);

    try {
      const csrfToken = Cookies.get('csrf_token')?.toString() ?? ""
      const response = await fetch(`${API_BASE}/calenders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // ★ この行を追加
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ name: newCalendar.calendarName }),
      });

      if (!response.ok) {
        throw new Error('カレンダーの追加に失敗しました');
      }

      const data = await response.json();
      const calender_id = data.id;

      const join_response = await fetch(`${API_BASE}/calenders/` + calender_id + "/join", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // ★ この行を追加
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ name: newCalendar.calendarName }),
      });

      if (!join_response.ok) {
        throw new Error('カレンダー追加時の初期処理に失敗しました[cannot join initial calendar]')
      }
      
      // 追加が成功したら、カレンダー一覧を再取得して画面を更新
      // const token = localStorage.getItem('access_token');
      // if(token) fetchCalendars(token);
      await fetchCalendars(accessToken);

      setIsTeamAddModalOpen(false);
      alert('カレンダーを追加しました');
    } catch (error: any) {
      console.error('カレンダーの追加エラー:', error);
      alert(`カレンダーの追加に失敗しました: ${error.message}`);
    }finally {
      setIsCreatingCalendar(false);
    }
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
          username={userStatus.username}
          hasCar={userStatus.hasCar}
          seatsRequired={userStatus.capacity}
          onEditClick={handleEditStatus}
          mailAddress={userStatus.mailAddress}
        />
        <main className={clsx("flex-grow p-8 overflow-y-auto")}>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">参加しているカレンダー一覧</h2>
          <div className="flex flex-wrap gap-4">
            {calendars.map((calendar) => (
              <Button
                key={calendar.id}
                onClick={() => onCalendarClick(calendar.id.toString())}
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
        onSave={handleSaveStatus} // ★ 作成した更新関数をモーダルに渡す
        initialStatus={userStatus} // ★ 現在のユーザー情報を初期値として渡す
      />

      <TeamAddModal
        isOpen={isTeamAddModalOpen}
        onClose={() => setIsTeamAddModalOpen(false)}
        onSave={handleSaveAddCalendar}
        isSaving={isCreatingCalendar} // ★ カレンダー作成中の状態を渡す
      />
    </div>
  );
}
