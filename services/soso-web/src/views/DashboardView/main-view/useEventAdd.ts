import { useState, useEffect } from 'react';
import { EventStatus } from '@/types/interfaces';


interface Participant {
  id: number;
  name: string;
  isChecked: boolean;
}

export const useEventAdd = (
  initialStatus: EventStatus,
  onSave: (status: EventStatus) => void,
  isOpen: boolean
) => {
  // フォームの状態
  const [date, setDate] = useState(initialStatus.date);
  const [title, setTitle] = useState(initialStatus.title);
  const [details, setDetails] = useState(initialStatus.details);
  const [dropOffTime, setDropOffTime] = useState(initialStatus.dropOffTime);
  const [pickUpTime, setPickUpTime] = useState(initialStatus.pickUpTime);
  const [dropOffCount, setDropOffCount] = useState(initialStatus.dropOffCount);
  const [pickUpCount, setPickUpCount] = useState(initialStatus.pickUpCount);
  const [departurePoint, setDeparturePoint] = useState(initialStatus.departurePoint);
  const [destinationPoint, setDestinationPoint] = useState(initialStatus.destinationPoint);
  
  // 参加者リストの管理
  const [participants, setParticipants] = useState<Participant[]>([]);

  // モーダルが開いたときに初期値をセット
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

      // メンバーリストを参加者オブジェクト配列に変換
      setParticipants(
        initialStatus.members.map((memberName, index) => ({
          id: index + 1,
          name: memberName,
          isChecked: false // 初期値はチェックなし
        }))
      );
    }
  }, [isOpen, initialStatus]);

  // ハンドラ: チェックボックスの切り替え
  const toggleParticipant = (id: number) => {
    setParticipants(prev =>
      prev.map(p => p.id === id ? { ...p, isChecked: !p.isChecked } : p)
    );
  };

  // ハンドラ: 保存実行
  const handleSubmit = () => {
    const selectedMembers = participants
      .filter(p => p.isChecked)
      .map(p => p.name);

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
  };

  return {
    formState: {
      date, setDate,
      title, setTitle,
      details, setDetails,
      dropOffTime, setDropOffTime,
      pickUpTime, setPickUpTime,
      dropOffCount, setDropOffCount,
      pickUpCount, setPickUpCount,
      departurePoint, setDeparturePoint,
      destinationPoint, setDestinationPoint,
      participants
    },
    toggleParticipant,
    handleSubmit
  };
};