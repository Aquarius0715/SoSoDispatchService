"use client";

import React, { useState } from 'react';
import EventDetailModal from '@/src/components/Modal/EventDetailModal';
import Button from '@/src/components/Button/Button';

// ダミーコンポーネント
// 実際のプロジェクトに合わせて適宜変更してください

const Input = ({ ...props }) => <input {...props} className="border p-2 rounded" />;

const eventData = {
  EventTitle: '新歓コンパ',
  EventDate: '2024年4月15日',
  EventTime: '18:00',
  EventDetail: '新入生歓迎コンパを開催します',
  EventURL: '#',
  member: ['田中太郎', '佐藤花子', '山田次郎', '鈴木三郎'],
  DropOffNumber: 2,
  PickUpNumber: 3,
  departurePoint: '大学',
  destination: '居酒屋〇〇',
  dispatchRegistered: ['山田次郎 (送り: 2人)'],
};

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Button onClick={handleOpenModal}>イベント詳細を見る</Button>
      {isModalOpen && (
        <EventDetailModal
          eventDetails={eventData}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Page;