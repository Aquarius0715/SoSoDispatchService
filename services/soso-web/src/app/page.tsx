'use client';
import React, { useState } from 'react';
import EventDetailModal from '../components/Modal/EventDetailModal';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const eventData = {
    EventTitle: '新歓コンパ',
    EventDate: '2024年4月15日',
    EventTime: '18:00',
    EventDetail: '新入生歓迎コンパを開催します',
    member: ['田中太郎', '佐藤花子', '山田次郎', '鈴木三郎'],
    DropOffNumber: 2,
    PickUpNumber: 3,
    departurePoint: '大学',
    destination: '居酒屋〇〇',
    dispatchRegistered: ['山田次郎 (送り: 2人)'],
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>モーダルを開く</button>
      {isModalOpen && (
        <EventDetailModal
          eventDetails={eventData}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;