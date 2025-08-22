import React, { useState } from 'react';
import Button from '../Button/Button';
import Input from '../TextFieald/Input';

// EventDetailModal.tsx のEventDetailsインターフェースを修正
export interface EventDetails {
  id: string;
  date: string;              // EventDate → date
  title: string;             // EventTitle → title  
  details: string;           // EventDetail → details (detailではなくdetails)
  dropOffTime: string;       // 追加
  pickUpTime: string;        // 追加
  dropOffCount: number;      // 追加
  pickUpCount: number;       // 追加
  departurePoint: string;    // 追加
  destinationPoint: string;  // 追加
  members: string[];         // 追加
  eventURL?: string;         // オプション
  dispatchRegistered?: string[]; // オプション
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: EventDetails; // 追加: イベントデータを受け取る
}

const EventDetailModal: React.FC<ModalProps> = ({ eventData, onClose }) => {
  const [seatsRequired, setSeatsRequired] = useState<number | ''>('');
  const [dropOffRemaining, setDropOffRemaining] = useState(eventData.dropOffCount);
  const [pickUpRemaining, setPickUpRemaining] = useState(eventData.pickUpCount);
  const [registered, setRegistered] = useState<string[]>(eventData.dispatchRegistered || []);

  const handleRegister = (type: 'dropOff' | 'pickUp') => {
    if (typeof seatsRequired === 'number' && seatsRequired > 0) {
      if (type === 'dropOff' && seatsRequired <= dropOffRemaining) {
        setDropOffRemaining(dropOffRemaining - seatsRequired);
        setRegistered(prev => [...prev, `山田次郎 (送り: ${seatsRequired}人)`]);
        alert(`送りで${seatsRequired}人登録しました。`);
      } else if (type === 'pickUp' && seatsRequired <= pickUpRemaining) {
        setPickUpRemaining(pickUpRemaining - seatsRequired);
        setRegistered(prev => [...prev, `山田次郎 (迎え: ${seatsRequired}人)`]);
        alert(`迎えで${seatsRequired}人登録しました。`);
      } else {
        alert('指定された人数は登録できません。');
      }
    } else {
      alert('有効な人数を入力してください。');
    }
  };

  // ★ 追加（コンポーネント上部などに）
  const fmtJstDate = (iso: string | undefined) =>
    iso ? new Date(iso).toLocaleDateString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric', month: '2-digit', day: '2-digit'
    }) : '';

  const fmtJstTime = (iso: string | undefined) =>
    iso ? new Date(iso).toLocaleTimeString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit', minute: '2-digit', hour12: false
    }) : '';


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-999">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg border border-gray-300 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-zinc-600 font-bold">イベント詳細</h2>
          <div className="flex items-center space-x-2">
            <Button className="bg-gray-700 text-white px-4 py-2 rounded text-sm">編集</Button>
            <button onClick={onClose} className="text-zinc-600 hover:text-gray-700 text-2xl font-light">
              &times;
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <Button className="bg-gray-700 text-white px-4 py-2 rounded w-full">イベント共有</Button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-zinc-600">
          <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">{eventData.title}</h3>
          <p className="mb-3">日付: {fmtJstDate(eventData.dropOffTime || eventData.pickUpTime)}</p>
          <p className="mb-3">開始時間: {fmtJstTime(eventData.dropOffTime || eventData.pickUpTime)}</p>
          <p className="mb-3">終了時間: {fmtJstTime(eventData.pickUpTime || eventData.pickUpTime)}</p>
          <p>詳細: {eventData.details}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-zinc-600">
          <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">参加者</h3>
          <p>{eventData.members.join('・')}</p>
        </div>

        <div className="flex justify-between space-x-4 mb-4 text-zinc-600">
          <div className="bg-gray-100 p-4 rounded-lg flex-1">
            <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">送り</h3>
            <p className="mb-3">合計: {eventData.dropOffCount}人</p>
            <p>残り: {dropOffRemaining}人</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg flex-1">
            <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">迎え</h3>
            <p className="mb-3">合計: {eventData.pickUpCount}人</p>
            <p >残り: {pickUpRemaining}人</p>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-zinc-600">
          <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">会場</h3>
          <p>{eventData.departurePoint} → {eventData.destinationPoint}</p>
          <p>会場URL: {eventData.eventURL}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-zinc-600">
          <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">配車登録済み</h3>
          {registered.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>

        <div className="text-zinc-600">
          <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">配車登録</h3>
          <div className="flex items-center mb-4">
            <p className="text-sm mr-2">乗車可能人数</p>
            <Input
              className="w-1/4 mr-2"
              type="number"
              value={seatsRequired}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                  setSeatsRequired(value === '' ? '' : Number(value));
                }
              }}
            />
            <span className="text-sm">人</span>
          </div>
          <div className="flex space-x-4">
            <Button
              className="bg-gray-700 px-0 py-4 hover:bg-gray-600 flex-1 text-white"
              onClick={() => handleRegister('pickUp')}
              disabled={typeof seatsRequired !== 'number' || seatsRequired <= 0}
            >
              迎え登録
            </Button>
            <Button
              className="bg-gray-700 px-0 py-4 hover:bg-gray-600 flex-1 text-white"
              onClick={() => handleRegister('dropOff')}
              disabled={typeof seatsRequired !== 'number' || seatsRequired <= 0}

            >
              送り登録
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;