import React, { useState } from 'react';
import Button from '../Button/Button';
import Input from '../TextFieald/Input';
import Cookies from 'js-cookie';

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
  const [isRegistering, setIsRegistering] = useState(false); // ローディング状態

    // ★ APIのベースURLと認証ヘッダー
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

    // ★ authHeaders関数を修正
  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem('access_token') ?? '';
    const csrf = Cookies.get('XSRF-TOKEN') ?? '';
    
    console.log('🔍 認証情報確認:');
    console.log('  - Access Token:', token ? `${token.substring(0, 20)}...` : '未設定');
    console.log('  - CSRF Token:', csrf || '未設定');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    // CSRFトークンが存在する場合のみ追加
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
    
    return headers;
  };

  const handleRegister = async (type: 'dropOff' | 'pickUp') => {
    if (typeof seatsRequired !== 'number' || seatsRequired <= 0) {
      alert('有効な人数を入力してください。');
      return;
    }

    // ★ 残席数チェック
    const remaining = type === 'dropOff' ? dropOffRemaining : pickUpRemaining;
    if (seatsRequired > remaining) {
      alert('指定された人数は登録できません。');
      return;
    }

    setIsRegistering(true);

    try {
      // ★ APIエンドポイント選択
      const endpoint = type === 'dropOff' 
        ? `${API_BASE}/events/${eventData.id}/return`  // 送り登録
        : `${API_BASE}/events/${eventData.id}/pickup`; // 迎え登録

      console.log('🔵 配車登録API呼び出し:', {
        endpoint,
        type,
        // seatsRequired,
        eventId: eventData.id
      });

      // ★ API呼び出し（リクエストボディが必要かは要確認）
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`配車登録に失敗: HTTP ${response.status} - ${errorText}`);
      }

      // ★ 成功時の処理
      if (type === 'dropOff') {
        setDropOffRemaining(dropOffRemaining - seatsRequired);
        setRegistered(prev => [...prev, `山田次郎 (送り: ${seatsRequired}人)`]);
        alert(`送りで${seatsRequired}人登録しました。`);
      } else {
        setPickUpRemaining(pickUpRemaining - seatsRequired);
        setRegistered(prev => [...prev, `山田次郎 (迎え: ${seatsRequired}人)`]);
        alert(`迎えで${seatsRequired}人登録しました。`);
      }

      // ★ 入力値をクリア
      setSeatsRequired('');

      console.log('🔵 配車登録が正常に完了しました');

    } catch (error) {
      console.error('🔴 配車登録エラー:', error);
      alert(`配車登録に失敗しました: ${error}`);
    } finally {
      setIsRegistering(false);
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
              disabled={isRegistering} // ★ 登録中は無効化
            />
            <span className="text-sm">人</span>
          </div>
          <div className="flex space-x-4">
            <Button
              className="bg-gray-700 px-0 py-4 hover:bg-gray-600 flex-1 text-white"
              onClick={() => handleRegister('dropOff')}
              disabled={typeof seatsRequired !== 'number' || seatsRequired <= 0 || isRegistering}
            >
              {isRegistering ? '登録中...' : '送り登録'}
            </Button>
                        <Button
              className="bg-gray-700 px-0 py-4 hover:bg-gray-600 flex-1 text-white"
              onClick={() => handleRegister('pickUp')}
              disabled={typeof seatsRequired !== 'number' || seatsRequired <= 0 || isRegistering}
            >
              {isRegistering ? '登録中...' : '迎え登録'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;