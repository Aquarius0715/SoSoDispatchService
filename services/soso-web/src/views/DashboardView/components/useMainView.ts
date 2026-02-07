'use client';

import { useState, useEffect } from 'react';
import { EventInput } from '@fullcalendar/core';

// フォーム状態の型定義
interface Participant {
  id: number;
  name: string;
  isChecked: boolean;
}

interface EventFormState {
  date: string;
  title: string;
  setTitle: (value: string) => void;
  details: string;
  setDetails: (value: string) => void;
  dropOffTime: string;
  setDropOffTime: (value: string) => void;
  pickUpTime: string;
  setPickUpTime: (value: string) => void;
  dropOffCount: number;
  setDropOffCount: (value: number) => void;
  pickUpCount: number;
  setPickUpCount: (value: number) => void;
  departurePoint: string;
  setDeparturePoint: (value: string) => void;
  destinationPoint: string;
  setDestinationPoint: (value: string) => void;
  participants: Participant[];
}

/**
 * カレンダーメインビューのロジックを管理するカスタムフック
 */
export const useMainView = () => {
  // イベント一覧の状態管理
  const [events, setEvents] = useState<EventInput[]>([]);

  // モーダル状態
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // フォーム状態
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [dropOffTime, setDropOffTime] = useState('');
  const [pickUpTime, setPickUpTime] = useState('');
  const [dropOffCount, setDropOffCount] = useState(0);
  const [pickUpCount, setPickUpCount] = useState(0);
  const [departurePoint, setDeparturePoint] = useState('');
  const [destinationPoint, setDestinationPoint] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);

  // 初期データ読み込み（TODO: API連携）
  useEffect(() => {
    // カレンダーメンバーや既存イベントを取得
    // 仮データ
    setParticipants([
      { id: 1, name: '山田太郎', isChecked: false },
      { id: 2, name: '佐藤花子', isChecked: false },
      { id: 3, name: '鈴木一郎', isChecked: false },
    ]);

    // TODO: 既存イベントをAPIから取得してsetEventsに設定
  }, []);

  // フォームのリセット
  const resetForm = () => {
    setTitle('');
    setDetails('');
    setDropOffTime('');
    setPickUpTime('');
    setDropOffCount(0);
    setPickUpCount(0);
    setDeparturePoint('');
    setDestinationPoint('');
    setParticipants(prev => prev.map(p => ({ ...p, isChecked: false })));
  };

  // 参加者のトグル
  const toggleParticipant = (id: number) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, isChecked: !p.isChecked } : p))
    );
  };

  // カレンダーの日付セルの+ボタンクリック
  const handleAddEventClick = (e: React.MouseEvent, arg: any) => {
    e.stopPropagation();

    const d = arg.date;
    const year = d.getFullYear();
    const month =  String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${date}`
    setSelectedDate(dateStr);
    resetForm();
    setIsAddModalOpen(true);
  };

  // イベント追加処理
  const handleSubmit = () => {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    const startDateTime = dropOffTime 
    ? `${selectedDate}T${dropOffTime}`
    : selectedDate;

    const endDateTime = pickUpTime
    ? `${selectedDate}T${pickUpTime}`
    : undefined;


    const newEvent: EventInput = {
      id: String(Date.now()), // 一意のID生成
      title,
      start: startDateTime,
      end: endDateTime,
      backgroundColor: '#3b82f6',
      borderColor: '#2563eb',
      extendedProps: {
        details,
        dropOffTime,
        pickUpTime,
        dropOffCount,
        pickUpCount,
        departurePoint,
        destinationPoint,
        participants: participants.filter(p => p.isChecked).map(p => p.name),
      },
    };

    // TODO: APIにPOSTリクエストを送信
    // 成功後に以下を実行
    setEvents(prev => [...prev, newEvent]);
    setIsAddModalOpen(false);
    resetForm();
  };

  // イベントクリック時の詳細表示
  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
    setIsDetailModalOpen(true);
  };

  // 詳細モーダルを閉じる
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null);
  };

  // 追加モーダルを閉じる
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  // EventAddViewに渡すフォーム状態
  const formState: EventFormState = {
    date: selectedDate,
    title,
    setTitle,
    details,
    setDetails,
    dropOffTime,
    setDropOffTime,
    pickUpTime,
    setPickUpTime,
    dropOffCount,
    setDropOffCount,
    pickUpCount,
    setPickUpCount,
    departurePoint,
    setDeparturePoint,
    destinationPoint,
    setDestinationPoint,
    participants,
  };

  return {
    // 状態
    events,
    isAddModalOpen,
    isDetailModalOpen,
    selectedEvent,
    formState,

    // アクション
    handleAddEventClick,
    handleEventClick,
    handleSubmit,
    toggleParticipant,
    handleCloseAddModal,
    handleCloseDetailModal,
  };
};