import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';
import Checkbox from '../Button/CheckBoxButton';
import TimePicker from '../Button/TimePickerButton';
import Textarea from '../TextFieald/Textfieald';
import Input from '../TextFieald/Input';

// EventStatusの型定義をモーダルの入力内容に合わせる
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

// EventAddModalのProps型定義
interface EventAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: EventStatus) => void;
  // 初期値のデータ構造をEventStatusに合わせる
  initialStatus: EventStatus;
}

// 参加者データの配列を定義
const initialParticipants = [
  { id: 1, name: '田中太郎', isChecked: false },
  { id: 2, name: '佐藤花子', isChecked: false },
  { id: 3, name: '山田次郎', isChecked: false },
];

const EventAddModal: React.FC<EventAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStatus
}) => {
  // initialStatusの値を各stateの初期値として設定
  const [title, setTitle] = useState(initialStatus.title);
  const [details, setDetails] = useState(initialStatus.details);
  const [dropOffTime, setDropOffTime] = useState(initialStatus.dropOffTime);
  const [pickUpTime, setPickUpTime] = useState(initialStatus.pickUpTime);
  const [dropOffCount, setDropOffCount] = useState(initialStatus.dropOffCount);
  const [pickUpCount, setPickUpCount] = useState(initialStatus.pickUpCount);
  const [departurePoint, setDeparturePoint] = useState(initialStatus.departurePoint);
  const [destinationPoint, setDestinationPoint] = useState(initialStatus.destinationPoint);
  
  // 参加者リストはローカルで管理
  const [participants, setParticipants] = useState(initialParticipants);

  // モーダル表示中のスクロールロック処理
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // チェックボックスの状態変更ハンドラ
  const handleCheckboxChange = (id: number) => {
    setParticipants(
      participants.map(participant =>
        participant.id === id ? { ...participant, isChecked: !participant.isChecked } : participant,
      ),
    );
  };

  // 入力フィールドの変更ハンドラ
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
    };
  };

  // 保存ボタンが押されたときの処理
  const handleSave = () => {
    const selectedMembers = participants.filter(p => p.isChecked).map(p => p.name);

    const eventStatus: EventStatus = {
      title,
      details,
      dropOffTime,
      pickUpTime,
      dropOffCount,
      pickUpCount,
      departurePoint,
      destinationPoint,
      members: selectedMembers,
    };
    
    onSave(eventStatus);
    
    console.log('保存ボタンがクリックされました', eventStatus);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-1/3 overflow-y-auto max-h-screen">
        <div className="p-4 border-b flex justify-between items-center">
          {/* ヘッダーのタイトルを黒文字に修正 */}
          <h3 className="text-xl font-bold text-black">予定追加</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 日付表示部分のテキストを黒文字に修正 */}
          <div className="text-center font-bold text-lg text-black">2024年4月5日</div>
          <div>
            {/* ラベルのテキストを黒文字に修正 */}
            <label className="block text-sm font-semibold mb-1 text-black">タイトル</label>
            <Input
              value={title}
              onChange={handleInputChange(setTitle)}
              placeholder="タイトル"
              className="w-full text-black"
            />
          </div>
          <div>
            {/* ラベルのテキストを黒文字に修正 */}
            <label className="block text-sm font-semibold mb-1 text-black">詳細</label>
            <Textarea
              value={details}
              onChange={handleInputChange(setDetails)}
              placeholder="詳細"
              className="w-full text-black"
            />
          </div>
          <div>
            {/* ラベルのテキストを黒文字に修正 */}
            <label className="block text-sm font-semibold mb-1 text-black">送り時刻</label>
            <TimePicker value={dropOffTime} onChange={setDropOffTime} />
          </div>
          <div>
            {/* ラベルのテキストを黒文字に修正 */}
            <label className="block text-sm font-semibold mb-1 text-black">迎え時刻</label>
            <TimePicker value={pickUpTime} onChange={setPickUpTime} />
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              {/* ラベルのテキストを黒文字に修正 */}
              <label className="block text-sm font-semibold mb-1 text-black">送り人数</label>
              <Input
                value={dropOffCount}
                onChange={handleInputChange(setDropOffCount)}
                placeholder="送り人数"
                className="w-full text-black"
              />
            </div>
            <div className="w-1/2">
              {/* ラベルのテキストを黒文字に修正 */}
              <label className="block text-sm font-semibold mb-1 text-black">迎え人数</label>
              <Input
                value={pickUpCount}
                onChange={handleInputChange(setPickUpCount)}
                placeholder="迎え人数"
                className="w-full text-black"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              {/* ラベルのテキストを黒文字に修正 */}
              <label className="block text-sm font-semibold mb-1 text-black">出発地</label>
              <Input
                value={departurePoint}
                onChange={handleInputChange(setDeparturePoint)}
                placeholder="出発地"
                className="w-full text-black"
              />
            </div>
            <div className="w-1/2">
              {/* ラベルのテキストを黒文字に修正 */}
              <label className="block text-sm font-semibold mb-1 text-black">目的地</label>
              <Input
                value={destinationPoint}
                onChange={handleInputChange(setDestinationPoint)}
                placeholder="目的地"
                className="w-full text-black"
              />
            </div>
          </div>
          <div>
            {/* 参加者セクションのタイトルを黒文字に修正 */}
            <h3 className="text-sm font-semibold mb-2 text-black">参加者</h3>
            <div className="border rounded-lg p-3 space-y-2">
              {participants.map(participant => (
                <label key={participant.id} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={participant.isChecked}
                    onChange={() => handleCheckboxChange(participant.id)}
                  />
                  {/* 参加者名のテキストを黒文字に修正 */}
                  <span className="text-black">{participant.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-center">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 w-full">
            入力完了
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventAddModal;
