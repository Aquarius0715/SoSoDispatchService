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

// APIのベースURLを環境変数から取得
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type ApiEvent = {
  id: string;
  calenderId: string;
  creatorId: string;
  title: string;
  description?: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  originLocation?: string;
  destinationLocation?: string;
  seatsRequiredGo: number;
  seatsRequiredReturn: number;
  participantUserIds: string[];
};

type ApiCalenderMember = {
  id: string;          // ← UUID（schemaのid）
  username: string;
  hasCar: boolean;
  capacity: number;    // ← あなたのUIの seatsRequired に対応
  sosoPoint: number;
};

// ★ authHeaders関数を修正
const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token') ?? '';
  const csrf = Cookies.get('csrf_token') ?? '';
  
  console.log('🔍 認証情報確認:');
  console.log('  - Access Token:', token ? `${token.substring(0, 20)}...` : '未設定');
  console.log('  - CSRF Token:', csrf || '未設定');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  // CSRFトークンが存在する場合のみ追加
  if (csrf) {
    headers['X-CSRF-Token'] = csrf;
  }
  
  return headers;
};

// ApiEvent -> FullCalendar形式
const mapApiEventToFC = (e: ApiEvent): EventInput => ({
  id: e.id,
  title: e.title,
  start: e.startTime,
  end: e.endTime,
  extendedProps: {
    details: e.description ?? '',
    dropOffTime: e.startTime,
    pickUpTime: e.endTime,
    dropOffCount: e.seatsRequiredGo,
    pickUpCount: e.seatsRequiredReturn,
    departurePoint: e.originLocation ?? '',
    destinationPoint: e.destinationLocation ?? '',
    members: e.participantUserIds, // ID配列（名前にしたければ後で突き合わせ）
  },
});

// ★ export default function の書き方に変更
// ▼ 変更: params を受け取らない
export default function DashboardPage() {
  const router = useRouter();
  // ★ 修正: id と slug の両方を取得
  const { id, slug } = useParams() as { id: string; slug: string };

  // --- ▼▼▼ すべてのState管理をここにまとめる ▼▼▼ ---
  // ★ 修正: id と slug を別々に管理し、slug をデコードして表示用タイトルに使用
  const [idState, setIdState] = useState<string>(id ?? '');
  const [slugState, setSlugState] = useState<string>(slug ?? '');
  const [decodedTitle, setDecodedTitle] = useState<string>(
    slug ? decodeURIComponent(slug) : ''
  );

  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [selectedManagementEvent, setSelectedManagementEvent] = useState<EventProps | null>(null);
  // ★ 修正: 初期値を空配列に変更（APIから取得するため）
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  // ★ 修正: 初期値を空配列に変更（APIから取得するため）
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<SOSOTransaction[]>([]);

  const [isSOSOEditModalOpen, setIsSOSOEditModalOpen] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<Member | null>(null);
  const [eventLogs, setEventLogs] = useState<{[eventId: string]: SOSOTransaction[]}>({});
  const [editSource, setEditSource] = useState<'sidebar' | 'management' | null>(null);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
  const [eventDetailData, setEventDetailData] = useState<EventDetails | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 既存: 一覧取得（関数にして再利用）
  const fetchEvents = async (calendarId: string) => {
    const res = await fetch(`${API_BASE}/calenders/${calendarId}/events`, {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`events HTTP ${res.status}`);
    const data: ApiEvent[] = await res.json();
    setEvents(data.map(mapApiEventToFC));
  };

  // --- ▼▼▼ useEffect ▼▼▼ ---
  // ★ 修正: id と slug の変化に合わせて state を更新
  useEffect(() => {
    console.log('🔍 useEffect実行:');
    console.log('  - id:', id);
    console.log('  - slug:', slug);
    
    if (!id || !slug) {
      console.log('🔴 id または slug が未定義です');
      return;
    }
    
    setIdState(id);
    setSlugState(slug);
    const decoded = decodeURIComponent(slug);
    setDecodedTitle(decoded);
    console.log('🔍 設定されたタイトル:', decoded);
  }, [id, slug]);

  // ★ 新規追加: APIからイベントとメンバーを取得
  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/'); // 未ログインならログインへ
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const headers = authHeaders();

    const evReq = fetch(`${API_BASE}/calenders/${id}/events`, {
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });

    const memReq = fetch(`${API_BASE}/calenders/${id}/members`, {
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });

    Promise.all([evReq, memReq])
      .then(async ([evRes, memRes]) => {
        if (!evRes.ok) throw new Error(`events HTTP ${evRes.status}`);
        if (!memRes.ok) throw new Error(`members HTTP ${memRes.status}`);

        const evData = (await evRes.json()) as ApiEvent[];
        const memData = (await memRes.json()) as ApiCalenderMember[];

        console.log('🔍 取得したイベントデータ:', evData);
        console.log('🔍 取得したメンバーデータ:', memData);

        // イベントをFullCalendarへ
        setEvents(evData.map(mapApiEventToFC));

        // メンバーをUI型へ（capacity -> seatsRequired に対応付け）
        const uiMembers: Member[] = memData.map((m, idx) => ({
          id: idx + 1,                  // 既存UIがnumber想定なら連番でOK（UUIDを保持したいなら別フィールド追加）
          username: m.username,
          hasCar: m.hasCar,
          seatsRequired: m.capacity,    // ← ここがポイント
          sosoPoint: m.sosoPoint,
          // userUuid: m.id,             // 必要なら隠しフィールドで保管
        }));
        setMembers(uiMembers);
      })
      .catch((e) => {
        if (e?.name !== 'AbortError') {
          setError(e.message ?? '取得に失敗しました');
          console.error('🔴 API取得エラー:', e);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id, router]);

  // --- ▼▼▼ 定数定義 ▼▼▼ ---
  const initialEventStatus: EventStatus = {
    date: '', title: '', details: '',
    dropOffTime: '', pickUpTime: '',
    dropOffCount: 0, pickUpCount: 0,
    departurePoint: '', destinationPoint: '',
    members: []
  };

// --- ▼▼▼ ハンドラ関数 ▼▼▼ ---
const handleSaveNewEvent = async (eventData: EventStatus) => {
  console.log("🔵 handleSaveNewEventが実行されました。");
  console.log("🔵 受け取ったeventData:", eventData);
  
  try {
    // ★ 修正: ISO 8601フォーマットに変更
    const startDateTime = eventData.dropOffTime 
      ? `${eventData.date}T${eventData.dropOffTime}:00.000Z`
      : `${eventData.date}T09:00:00.000Z`;
    
    const endDateTime = eventData.pickUpTime 
      ? `${eventData.date}T${eventData.pickUpTime}:00.000Z`
      : `${eventData.date}T10:00:00.000Z`;

    // ★ 修正: データ検証を追加
    const apiEventData = {
      title: String(eventData.title || ''), // 空文字列対策
      description: String(eventData.details || ''), // 空文字列対策
      startTime: startDateTime,
      endTime: endDateTime,
      originLocation: String(eventData.departurePoint || ''), // 空文字列対策
      destinationLocation: String(eventData.destinationPoint || ''), // 空文字列対策
      seatsRequiredGo: Number(eventData.dropOffCount) || 0, // 数値保証
      seatsRequiredReturn: Number(eventData.pickUpCount) || 0, // 数値保証
      participantUserIds: Array.isArray(eventData.members) ? eventData.members : [], // 配列保証
    };

    // ★ 詳細なデバッグ情報
    console.log('🔵 APIに送信するデータ:', JSON.stringify(apiEventData, null, 2));
    console.log('🔵 各フィールドの詳細:');
    console.log('  - title:', typeof apiEventData.title, `"${apiEventData.title}"`);
    console.log('  - description:', typeof apiEventData.description, `"${apiEventData.description}"`);
    console.log('  - startTime:', typeof apiEventData.startTime, `"${apiEventData.startTime}"`);
    console.log('  - endTime:', typeof apiEventData.endTime, `"${apiEventData.endTime}"`);
    console.log('  - originLocation:', typeof apiEventData.originLocation, `"${apiEventData.originLocation}"`);
    console.log('  - destinationLocation:', typeof apiEventData.destinationLocation, `"${apiEventData.destinationLocation}"`);
    console.log('  - seatsRequiredGo:', typeof apiEventData.seatsRequiredGo, apiEventData.seatsRequiredGo);
    console.log('  - seatsRequiredReturn:', typeof apiEventData.seatsRequiredReturn, apiEventData.seatsRequiredReturn);
    console.log('  - participantUserIds:', typeof apiEventData.participantUserIds, apiEventData.participantUserIds);

    // ★ バリデーション追加
    if (!apiEventData.title.trim()) {
      throw new Error('イベントタイトルは必須です');
    }

    // ヘッダーを確認
    const headers = authHeaders();
    console.log('🔵 送信ヘッダー:', headers);

    // APIにPOSTリクエストを送信
    const response = await fetch(`${API_BASE}/calenders/${id}/events`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(apiEventData),
    });

    console.log('🔵 レスポンスステータス:', response.status);
    console.log('🔵 レスポンスヘッダー:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 エラーレスポンス:', errorText);
      throw new Error(`イベント作成に失敗しました: HTTP ${response.status} - ${errorText}`);
    }

    const createdEvent = (await response.json()) as ApiEvent;
    console.log('🔵 作成されたイベント:', createdEvent);

    // 成功した場合、イベントリストを再取得
    await fetchEvents(id);
    
    // モーダルを閉じる
    setIsAddModalOpen(false);
    
    console.log('🔵 新しいイベントが正常に作成されました');
    
  } catch (error) {
    console.error('🔴 イベント作成エラー:', error);
    alert(`イベントの作成に失敗しました: ${error}`);
    // エラーが発生してもモーダルは開いたままにする
  }
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
      if (eventDate > today) {
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

  // ★ ローディング表示を追加
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  // ★ エラー表示を追加
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">エラー: {error}</div>
      </div>
    );
  }

  

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <CalendarHeader
        pageTitle={decodedTitle}
        onLogout={handleLogout}
        onClickLogo={handleLogoClick}
        calendarUrl={`https://example.com/dashboard/share/${idState}/${slugState}`}
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