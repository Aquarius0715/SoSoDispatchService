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
  const [seatsRequired, setSeatsRequired] = useState<number | ''>(1); // デフォルト値を1に設定
  const [dropOffRemaining, setDropOffRemaining] = useState(eventData.dropOffCount);
  const [pickUpRemaining, setPickUpRemaining] = useState(eventData.pickUpCount);
  const [registered, setRegistered] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false); // ローディング状態
  //新規追加
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(true);
  const [userDropOffRegistered, setUserDropOffRegistered] = useState(false); // 現在のユーザーの送り登録状況
  const [userPickUpRegistered, setUserPickUpRegistered] = useState(false); // 現在のユーザーの迎え登録状況
  // detail API のレスポンスを格納するローカル state
  const [detailData, setDetailData] = useState<any | null>(null);

    // ★ APIのベースURLと認証ヘッダー
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  console.log("🔍 イベントID:", eventData.id);
  //新規追加
  // ★ 配車登録データを取得する関数
  const fetchDispatchRegistrations = async () => {
    try {
      setIsLoadingRegistrations(true);
      
  // イベント詳細APIから現在の登録状況を取得 (/detail エンドポイント)
  const response = await fetch(`${API_BASE}/events/${eventData.id}/detail`, {
        headers: authHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
  const eventDetails = await response.json();
  console.log('🔍 イベント詳細レスポンス (/detail):', eventDetails);

  // 保存して UI で参照できるようにする
  setDetailData(eventDetails);

        // 現在のユーザーIDを取得（複数のキーを試行）
        let currentUserId = localStorage.getItem('user_id') || 
                           localStorage.getItem('userId') || 
                           localStorage.getItem('id');
        
        // JWTトークンからユーザーIDを取得する場合
        if (!currentUserId) {
          const token = localStorage.getItem('access_token');
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              currentUserId = payload.user_id || payload.userId || payload.sub || payload.id;
            } catch (error) {
              console.warn('JWTトークンの解析に失敗:', error);
            }
          }
        }
        
        console.log('🔍 現在のユーザーID:', currentUserId);
        console.log('🔍 LocalStorage keys:', Object.keys(localStorage));
        
        // /detail のレスポンスは参加者一覧を `participants` に返す想定
        const registrations: string[] = [];
        let currentUserDropOff = false;
        let currentUserPickUp = false;

        if (Array.isArray(eventDetails.participants)) {
          for (const p of eventDetails.participants) {
            // participants はユーザ名の配列の想定
            registrations.push(p);
          }
        }
        
        // 現在のユーザーの登録状況をステートに保存
        setUserDropOffRegistered(currentUserDropOff);
        setUserPickUpRegistered(currentUserPickUp);
        
  setRegistered(registrations);
        console.log('🔍 配車登録一覧:', registrations);
        console.log('🔍 現在のユーザー状況:', {
          dropOff: currentUserDropOff,
          pickUp: currentUserPickUp,
          userId: currentUserId
        });      } else {
        console.error('配車登録データの取得に失敗:', response.status);
        setRegistered([]);
      }
    } catch (error) {
      console.error('配車登録データの取得エラー:', error);
      setRegistered([]);
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  // ★ コンポーネントマウント時に配車登録データを取得
  React.useEffect(() => {
    fetchDispatchRegistrations();
  }, [eventData.id]);

    // ★ authHeaders関数を修正
  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem('access_token') ?? '';
    const csrf = Cookies.get('XSRF-TOKEN') ?? '';
    
    // console.log('🔍 認証情報確認:');
    // console.log('  - Access Token:', token ? `${token.substring(0, 20)}...` : '未設定');
    // console.log('  - CSRF Token:', csrf || '未設定');
    
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

  const handlePickUp = async () => {
    await handleRegister('pickUp');
  };

  const handleRegister = async (type: 'dropOff' | 'pickUp') => {
    if (typeof seatsRequired !== 'number' || seatsRequired <= 0) {
      alert('有効な人数を入力してください。');
      return;
    }

    //新規追加
    // ★ 重複登録防止チェック（調整版）
    if (type === 'dropOff' && userDropOffRegistered) {
      alert('既に送り登録済みです。');
      return;
    }
    if (type === 'pickUp' && userPickUpRegistered) {
      alert('既に迎え登録済みです。');
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

      //新規追加
      // ★ リクエストボディを追加（テスト用）
      // const requestBody = {
      //   seatsRequired: seatsRequired, ///////初期値が1になってる！！！
      // };

      console.log('🔵 配車登録API呼び出し:', {
        endpoint,
        type,
        seatsRequired,
        eventId: eventData.id,
        //requestBody
      });

      // ★ テスト用: まずボディなしで試す
      console.log('🧪 テスト: リクエストボディなしで試行...');
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        // body: JSON.stringify(requestBody), // ★ 一時的にコメントアウト
      });

      //　リクエストbodyを求めていないからやらない！！！
      // //新規追加
      // // もし404や400エラーの場合、ボディありで再試行
      // if (!response.ok && (response.status === 400 || response.status === 404)) {
      //   console.log('🧪 テスト: リクエストボディありで再試行...');
      //   response = await fetch(endpoint, {
      //     method: 'POST',
      //     headers: authHeaders(),
      //     credentials: 'include',
      //     body: JSON.stringify(requestBody), // ★ ボディありで再試行
      //   });
      // }

      console.log('🔍 レスポンス情報:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
      console.log('  - URL:', response.url);
      console.log('  - OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        //新規追加
        console.error('🔴 エラーレスポンス:', errorText);
        console.error('🔴 詳細情報:');
        console.error('  - Request URL:', endpoint);
        console.error('  - Request Method: POST');
        console.error('  - Event ID:', eventData.id);
        console.error('  - User Token Present:', !!localStorage.getItem('access_token'));
        console.error('  - CSRF Token Present:', !!Cookies.get('XSRF-TOKEN'));
        
        let errorMessage = `配車登録に失敗: HTTP ${response.status}`;
        
        // 重複登録エラーの場合
        if (response.status === 409 || errorText.includes('already registered')) {
          const registrationType = type === 'pickUp' ? '迎え' : '送り';
          errorMessage = `既に${registrationType}登録済みです`;
          
          // 登録状況を更新
          if (type === 'pickUp') {
            setUserPickUpRegistered(true);
          } else {
            setUserDropOffRegistered(true);
          }
          
          // 登録データを再取得
          await fetchDispatchRegistrations();
          
        } else if (response.status === 500) {
          // 500エラーの場合、より詳細な情報を提供
          errorMessage = `サーバーエラーが発生しました。既に登録済みの可能性があります。`;
        } else {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage += ` - ${errorData.message || errorData.error || errorText}`;
          } catch (e) {
            errorMessage += ` - ${errorText}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // レスポンスボディが空の場合を考慮
      let responseData = null;
      const contentLength = response.headers.get('content-length');
      if (contentLength && contentLength !== '0') {
        try {
          responseData = await response.json();
        } catch (e) {
          console.log('🔵 JSONパースできませんが成功:', response.status);
          responseData = {};
        }
      } else {
        console.log('🔵 空のレスポンスですが成功:', response.status);
        responseData = {};
      }
      console.log('🔵 成功レスポンス:', responseData);

      // ★ 成功時の処理
      if (type === 'dropOff') {
        setDropOffRemaining(dropOffRemaining - seatsRequired);
        setUserDropOffRegistered(true); // 現在のユーザーの送り登録状況を更新
        alert(`送りで${seatsRequired}人登録しました。`);
      } else {
        setPickUpRemaining(pickUpRemaining - seatsRequired);
        setUserPickUpRegistered(true); // 現在のユーザーの迎え登録状況を更新
        alert(`迎えで${seatsRequired}人登録しました。`);
      }

      // ★ 入力値をクリア
      setSeatsRequired('');
      //新規追加

      // ★ 配車登録リストを更新
      await fetchDispatchRegistrations();

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
          <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">{detailData?.title ?? eventData.title}</h3>
          <p className="mb-3">日付: {fmtJstDate(detailData?.startTime ?? eventData.dropOffTime ?? eventData.pickUpTime)}</p>
          <p className="mb-3">開始時間: {fmtJstTime(detailData?.startTime ?? eventData.dropOffTime ?? eventData.pickUpTime)}</p>
          <p className="mb-3">終了時間: {fmtJstTime(detailData?.endTime ?? eventData.pickUpTime ?? eventData.pickUpTime)}</p>
          <p>詳細: {detailData?.description ?? eventData.details}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-zinc-600">
          <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">参加者</h3>
          <p>{(detailData?.participants ?? eventData.members).join ? (detailData?.participants ?? eventData.members).join('・') : ''}</p>
        </div>

        <div className="flex justify-between space-x-4 mb-4 text-zinc-600">
          <div className="bg-gray-100 p-4 rounded-lg flex-1">
            <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">送り</h3>
            <p className="mb-3">合計: {detailData?.seatsRequiredReturn ?? eventData.dropOffCount}人</p>
            <p>残り: {dropOffRemaining}人</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg flex-1">
            <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">迎え</h3>
            <p className="mb-3">合計: {detailData?.seatsRequiredGo ?? eventData.pickUpCount}人</p>
            <p >残り: {pickUpRemaining}人</p>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-zinc-600">
          <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">会場</h3>
          <p>{detailData?.originLocation ?? eventData.departurePoint} → {detailData?.destinationLocation ?? eventData.destinationPoint}</p>
          <p>会場URL: {detailData?.eventURL ?? eventData.eventURL}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-zinc-600">
          <h3 className="font-normal font-['Inter'] text-black text-lg mb-2">配車登録済み</h3>
          {/* 新規追加 */}
          {isLoadingRegistrations ? (
            <p className="text-gray-500">読み込み中...</p>
          ) : registered.length > 0 ? (
            registered.map((item, index) => (
              <p key={index}>{item}</p>
           //新規追加
            ))
          ) : (
            <p className="text-gray-500">配車登録はありません</p>
          )}
        </div>

        <div className="text-zinc-600">
          <div className="flex space-x-4">
            <Button
              className={`px-0 py-4 flex-1 text-white ${
                userDropOffRegistered 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => handleRegister('dropOff')}
              disabled={
                      typeof seatsRequired !== 'number' || 
                      seatsRequired <= 0 || 
                      isRegistering || 
                      userDropOffRegistered || 
                      userPickUpRegistered  // ★ 問題：両方を無効化
                    }
            >
              {isRegistering ? '登録中...' : 
               userDropOffRegistered ? '送り登録済み' : '送り登録'}
            </Button>
            <Button
              className={`px-0 py-4 flex-1 text-white ${
                userPickUpRegistered 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => handleRegister('pickUp')}
              disabled={
                      typeof seatsRequired !== 'number' || 
                      seatsRequired <= 0 || 
                      isRegistering || 
                      userDropOffRegistered // 送り登録済みの場合のみ無効化
                    }
            >
              {isRegistering ? '登録中...' : 
               userPickUpRegistered ? '迎え登録済み' : '迎え登録'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;