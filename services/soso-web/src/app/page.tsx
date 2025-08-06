'use client'; // Next.jsのApp Routerでは、クライアントコンポーネントとして宣言する必要があります。

import React, { useState } from 'react';
import EventAddModal from '../components/Modal/EventAddModal'; // モーダルコンポーネントのインポート

// EventStatusの型定義 (EventAddModal.tsxからコピーし、page.tsxの要件に合わせる)
// EventAddModalのinitialStatusとonSaveの引数に合わせる必要があります。
interface EventStatus {
  title: string;
  details: string;
  dropOffTime: string; // 送り時刻
  pickUpTime: string;  // 迎え時刻
  dropOffCount: string; // 送り人数
  pickUpCount: string;  // 迎え人数
  departurePoint: string;
  destinationPoint: string;
  members: string[]; // 参加者
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 保存されたデータを表示するために、型をEventStatusに更新
  const [savedEventStatus, setSavedEventStatus] = useState<EventStatus | null>(null);

  // EventAddModalのinitialStatusに渡す初期データ
  const initialEventStatus: EventStatus = {
    title: '初期イベント',
    details: '初期詳細内容',
    dropOffTime: '09:00',
    pickUpTime: '17:00',
    dropOffCount: '1',
    pickUpCount: '1',
    departurePoint: '東京駅',
    destinationPoint: '新宿駅',
    members: ['田中太郎'], // 初期選択メンバー
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // EventAddModalから受け取るデータ型をEventStatusに変更
  const handleSaveModal = (status: EventStatus) => {
    console.log('保存されたイベントデータ:', status);
    setSavedEventStatus(status); // 保存されたデータをstateにセット
    setIsModalOpen(false); // 保存後にモーダルを閉じる
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">予定追加モーダルのテストページ</h1>

      <button
        onClick={handleOpenModal}
        className="px-6 py-3 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
      >
        予定追加モーダルを開く
      </button>

      {/* 保存されたイベントデータを表示 */}
      {savedEventStatus && (
        <div className="mt-8 p-4 border rounded-lg bg-white shadow-sm text-gray-800">
          <h2 className="text-xl font-semibold mb-2">保存されたイベントデータ:</h2>
          <p><strong>タイトル:</strong> {savedEventStatus.title}</p>
          <p><strong>詳細:</strong> {savedEventStatus.details}</p>
          <p><strong>送り時刻:</strong> {savedEventStatus.dropOffTime}</p>
          <p><strong>迎え時刻:</strong> {savedEventStatus.pickUpTime}</p>
          <p><strong>送り人数:</strong> {savedEventStatus.dropOffCount}</p>
          <p><strong>迎え人数:</strong> {savedEventStatus.pickUpCount}</p>
          <p><strong>出発地:</strong> {savedEventStatus.departurePoint}</p>
          <p><strong>目的地:</strong> {savedEventStatus.destinationPoint}</p>
          <p><strong>参加者:</strong> {savedEventStatus.members.join(', ')}</p>
        </div>
      )}

      {/* EventAddModalコンポーネント */}
      <EventAddModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
        initialStatus={initialEventStatus} // 渡す初期データをEventStatus型に合わせる
      />
    </main>
  );
}
