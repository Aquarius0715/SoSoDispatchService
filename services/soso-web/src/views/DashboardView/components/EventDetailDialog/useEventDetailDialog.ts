// src/views/DashboardView/components/EventDetailDialog/useEventDetailDialog.ts
import { useState } from 'react';
import { useSnackbar } from "@/components/ui/snackbar";
// import { registerEvent } from "@/requests/eventAPI"; // ※API実装後にコメントアウト解除

// イベント情報の型定義（本来は共通の型定義ファイルからインポート推奨）
export interface EventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  url?: string;
  extendedProps: {
    dropOffCount: number;
    pickUpCount: number;
    seatsRequiredGo: number;
    seatsRequiredReturn: number;
    participants: string[];
    description?: string;
    originLocation?: string;
    destinationLocation?: string;
  };
}

interface UseEventDetailDialogProps {
  eventData: EventData;
  onClose: () => void;
  onSuccess: () => void; // 登録成功時のリロード用
}

export const useEventDetailDialog = ({ eventData, onClose, onSuccess }: UseEventDetailDialogProps) => {
  const { showSnackbar } = useSnackbar();
  const [isRegistering, setIsRegistering] = useState(false);

  // ユーザーの登録状況（仮実装：本来はAPIやContextから自分のIDと比較して判定）
  const [userDropOffRegistered, setUserDropOffRegistered] = useState(false);
  const [userPickUpRegistered, setUserPickUpRegistered] = useState(false);

  // 配車登録処理
  const handleRegister = async (type: 'dropOff' | 'pickUp') => {
    setIsRegistering(true);
    try {
      // API呼び出し（仮）
      console.log(`Registering for ${type} on event ${eventData.id}`);
      // await registerEvent(eventData.id, type);
      
      // 成功時
      if (type === 'dropOff') setUserDropOffRegistered(true);
      else setUserPickUpRegistered(true);
      
      showSnackbar("登録しました", "success");
      onSuccess();
    } catch (error) {
      console.error(error);
      showSnackbar("登録に失敗しました", "error");
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    isRegistering,
    userDropOffRegistered,
    userPickUpRegistered,
    handleRegister,
    // 表示用に整形したデータを返す
    displayData: {
      title: eventData.title,
      date: eventData.start,
      startTime: eventData.start,
      endTime: eventData.end,
      description: eventData.extendedProps.description,
      participants: eventData.extendedProps.participants || [],
      seatsReturnTotal: eventData.extendedProps.seatsRequiredReturn || 0,
      seatsGoTotal: eventData.extendedProps.seatsRequiredGo || 0,
      origin: eventData.extendedProps.originLocation,
      destination: eventData.extendedProps.destinationLocation,
      url: eventData.url,
      // 残り席数計算（仮：定員 - 現在の参加人数 などのロジックを入れる）
      dropOffRemaining: eventData.extendedProps.dropOffCount, 
      pickUpRemaining: eventData.extendedProps.pickUpCount
    }
  };
};