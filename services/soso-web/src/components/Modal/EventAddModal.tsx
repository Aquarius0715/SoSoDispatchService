import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';
import Checkbox from '../Button/CheckBoxButton';
import TimePicker from '../Button/TimePickerButton';
import Textarea from '../TextFieald/Textfieald';
import Input from '../TextFieald/Input';

// EventStatusの型定義をモーダルの入力内容に合わせる
interface EventStatus {
  date: string; // 日付
  title: string;
  details: string;
  dropOffTime: string; // 送り時刻
  pickUpTime: string; // 迎え時刻
  dropOffCount: number; // 送り人数
  pickUpCount: number; // 迎え人数
  departurePoint: string;
  destinationPoint: string;
  members: string[];
}

// EventAddModalが受け取るPropsの型
interface EventAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: EventStatus) => void;
  initialStatus: EventStatus;
}
interface Participant {
  id: number;
  name: string;
  isChecked: boolean;
}

const EventAddModal: React.FC<EventAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStatus,
}) => {
  const [date, setDate] = useState(initialStatus.date);
  const [title, setTitle] = useState(initialStatus.title);
  const [details, setDetails] = useState(initialStatus.details);
  const [dropOffTime, setDropOffTime] = useState(initialStatus.dropOffTime);
  const [pickUpTime, setPickUpTime] = useState(initialStatus.pickUpTime);
  const [dropOffCount, setDropOffCount] = useState(initialStatus.dropOffCount);
  const [pickUpCount, setPickUpCount] = useState(initialStatus.pickUpCount);
  const [departurePoint, setDeparturePoint] = useState(initialStatus.departurePoint);
  const [destinationPoint, setDestinationPoint] = useState(initialStatus.destinationPoint);

  const [participants, setParticipants] = useState<Participant[]>([]);

  const [dropOffCountInput, setDropOffCountInput] = useState(
  initialStatus.dropOffCount === 0 ? '' : String(initialStatus.dropOffCount)
);
  const [pickUpCountInput, setPickUpCountInput] = useState(
    initialStatus.pickUpCount === 0 ? '' : String(initialStatus.pickUpCount)
  );

  // 日付のフォーマット処理を修正
  const formatDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      // 無効な日付の場合のフォールバック
      if (isNaN(dateObj.getTime())) {
        return dateString;
      }
      return dateObj.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    } catch (error) {
      return dateString;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDate(initialStatus.date);
      setTitle(initialStatus.title);
      setDetails(initialStatus.details);
      setDropOffTime(initialStatus.dropOffTime);
      setPickUpTime(initialStatus.pickUpTime);
      setDropOffCount(initialStatus.dropOffCount);
      setPickUpCount(initialStatus.pickUpCount);
      setDeparturePoint(initialStatus.departurePoint);
      setDestinationPoint(initialStatus.destinationPoint);
      //setParticipants(initialStatus.members.map(p => ({ ...p, isChecked: false })));
      setParticipants(
        initialStatus.members.map((memberName, index) => ({
          id: index + 1,
          name: memberName,
          isChecked: false
        }))
      );

      

      //string[]からPar
    }
  }, [isOpen, initialStatus]);

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

  const handleCheckboxChange = (id: number) => {
    setParticipants(prevParticipants =>
      prevParticipants.map(p =>
        p.id === id ? { ...p, isChecked: !p.isChecked } : p
      )
    );
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
    };
  };

  // 送り人数用のハンドラー
const handleDropOffCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const inputValue = e.target.value;
  setDropOffCountInput(inputValue); // 入力フィールドは常に文字列で更新
  
  // 保存時に使う数値の状態を更新
  setDropOffCount(parseInt(inputValue) || 0); 
};

// 迎え人数用のハンドラーを追加
const handlePickUpCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const inputValue = e.target.value;
  setPickUpCountInput(inputValue); // 入力フィールドは常に文字列で更新
  
  // 保存時に使う数値の状態を更新
  setPickUpCount(parseInt(inputValue) || 0); 
};

  // 保存ボタンが押されたときの処理
  const handleSave = () => {
    const selectedMembers = participants.filter(p => p.isChecked).map(p => p.name);
    const eventStatus: EventStatus = {
      date,
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
    onClose();
  };

  if (!isOpen) return null;
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-1/3 overflow-y-auto max-h-screen">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-black">予定追加</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* 日付表示を修正 */}
          <div className="text-center font-bold text-lg text-black bg-blue-50 p-2 rounded">
            {date}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">タイトル</label>
            <Input value={title} onChange={handleInputChange(setTitle)} placeholder="タイトル" className="w-full text-black" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">詳細</label>
            <Textarea value={details} onChange={handleInputChange(setDetails)} placeholder="詳細" className="w-full text-black" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">送り時刻</label>
            <TimePicker value={dropOffTime} onChange={setDropOffTime} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">迎え時刻</label>
            <TimePicker value={pickUpTime} onChange={setPickUpTime} />
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-semibold mb-1 text-black">送り人数</label>
              <Input value={dropOffCountInput} onChange={handleDropOffCountChange} placeholder="送り人数" className="w-full text-black" />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-semibold mb-1 text-black">迎え人数</label>
              <Input
                value={pickUpCountInput}
                onChange={handlePickUpCountChange}
                placeholder="迎え人数"
                className="w-full text-black"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-semibold mb-1 text-black">出発地</label>
              <Input value={departurePoint} onChange={handleInputChange(setDeparturePoint)} placeholder="出発地" className="w-full text-black" />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-semibold mb-1 text-black">目的地</label>
              <Input value={destinationPoint} onChange={handleInputChange(setDestinationPoint)} placeholder="目的地" className="w-full text-black" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-black">参加者</h3>
            <div className="border rounded-lg p-3 space-y-2">
              {participants.map(p => (
                <label key={p.id} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox checked={p.isChecked} onChange={() => handleCheckboxChange(p.id)} />
                  <span className="text-black">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-center">
          <Button onClick={handleSave} className="text-white bg-gray-600 hover:bg-gray-700 w-full">
            入力完了
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventAddModal;