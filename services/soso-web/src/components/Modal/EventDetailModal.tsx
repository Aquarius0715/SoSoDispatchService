import React, { useState } from 'react';
import Button from '../Button/Button';
import Input from '../TextFieald/Input';

interface EventDetails {
  EventTitle: string;
  EventDate: string;
  EventTime: string;
  EventDetail: string;
  EventURL: string;
  member: string[];
  DropOffNumber: number;
  PickUpNumber: number;
  departurePoint: string;
  destination: string;
  dispatchRegistered: string[];
}

interface ModalProps {
  eventDetails: EventDetails;
  onClose: () => void;
}

const EventDetailModal: React.FC<ModalProps> = ({ eventDetails, onClose }) => {
  const [passengers, setPassengers] = useState<number | ''>('');
  const [dropOffRemaining, setDropOffRemaining] = useState(eventDetails.DropOffNumber);
  const [pickUpRemaining, setPickUpRemaining] = useState(eventDetails.PickUpNumber);
  const [registered, setRegistered] = useState(eventDetails.dispatchRegistered);

  const handleRegister = (type: 'dropOff' | 'pickUp') => {
    if (typeof passengers === 'number' && passengers > 0) {
      if (type === 'dropOff' && passengers <= dropOffRemaining) {
        setDropOffRemaining(dropOffRemaining - passengers);
        setRegistered(prev => [...prev, `山田次郎 (送り: ${passengers}人)`]);
        alert(`送りで${passengers}人登録しました。`);
      } else if (type === 'pickUp' && passengers <= pickUpRemaining) {
        setPickUpRemaining(pickUpRemaining - passengers);
        setRegistered(prev => [...prev, `山田次郎 (迎え: ${passengers}人)`]);
        alert(`迎えで${passengers}人登録しました。`);
      } else {
        alert('指定された人数は登録できません。');
      }
    } else {
      alert('有効な人数を入力してください。');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-black font-bold">イベント詳細</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>
        <div className="flex justify-between   text-black  items-center mb-6">
          <Button>イベント共有</Button>
          <Button>編集</Button>
        </div>

        <div className="text-black mb-6">
          <h3 className="font-bold text-lg mb-2">{eventDetails.EventTitle}</h3>
          <p>日付: {eventDetails.EventDate}</p>
          <p>時刻: {eventDetails.EventTime}</p>
          <p>詳細: {eventDetails.EventDetail}</p>
        </div>

        <div className="text-black mb-6">
          <h3 className="font-bold text-lg mb-2">参加者</h3>
          <p>{eventDetails.member.join(', ')}</p>
        </div>

        <div className="text-black mb-6">
          <h3 className="font-bold text-lg mb-2">送迎</h3>
          <div className="flex justify-between space-x-4 mb-2">
            <div className="bg-gray-100 p-4 rounded-lg flex-1">
              <p className="font-bold">送り</p>
              <p>残り: {dropOffRemaining}人</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg flex-1">
              <p className="font-bold">迎え</p>
              <p>残り: {pickUpRemaining}人</p>
            </div>
          </div>
          <p>{eventDetails.departurePoint} =&gt; {eventDetails.destination}</p>
        </div>

        <div className="text-black mb-6">
          <h3 className="font-bold text-lg mb-2">配車登録済み</h3>
          {registered.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>

        <div>
          <h3 className="text-black font-bold text-lg mb-2">配車登録</h3>
          <p className="text-sm text-black mb-2">乗車可能人数</p>
          <Input
            className="w-full mb-4 text-black "
            type="number"
            value={passengers}
            onChange={(e) => {
            const value = e.target.value;
            // ここでバリデーション
            if (value === '' || !isNaN(Number(value))) {
                setPassengers(value === '' ? '' : Number(value));
            }
            }}
          />
          <div className="flex space-x-4">
            <Button
              className="bg-blue-500 hover:bg-blue-600 flex-1"
              onClick={() => handleRegister('dropOff')}
              disabled={typeof passengers !== 'number' || passengers <= 0}
            >
              送り登録
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 flex-1"
              onClick={() => handleRegister('pickUp')}
              disabled={typeof passengers !== 'number' || passengers <= 0}
            >
              迎え登録
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;

//親コンポーネントで呼び出すデータの例
// const eventData = {
//     EventTitle: '新歓コンパ',
//     EventDate: '2024年4月15日',
//     EventTime: '18:00',
//     EventDetail: '新入生歓迎コンパを開催します',
//     member: ['田中太郎', '佐藤花子', '山田次郎', '鈴木三郎'],
//     DropOffNumber: 2,
//     PickUpNumber: 3,
//     departurePoint: '大学',
//     destination: '居酒屋〇〇',
//     dispatchRegistered: ['山田次郎 (送り: 2人)'],
//   };