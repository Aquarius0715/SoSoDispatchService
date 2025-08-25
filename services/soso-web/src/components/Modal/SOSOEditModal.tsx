import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';
import clsx from 'clsx';
import { Member } from '../MemberList/MenberList';
import Cookies from 'js-cookie';

interface EditedMemberData extends Member {
  reason: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedData: EditedMemberData) => void;
  initialData: Member;
  calenderId: string; // カレンダーIDを追加
}

const SOSOEditModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData, calenderId }) => {
  const [editedData, setEditedData] = useState<EditedMemberData>({
    ...initialData,
    reason: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // ★ APIのベースURLと認証ヘッダー
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  // ★ 認証ヘッダー生成関数
  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem('access_token') ?? '';
    const csrf = Cookies.get('XSRF-TOKEN') ?? '';
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
    
    return headers;
  };

  // ★ JWTトークンからユーザーUUIDを取得する関数
  const getUserUUIDFromToken = (): string | null => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;

      // JWTトークンをデコード（Base64）
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      console.log('🔵 JWT Payload:', decodedPayload);
      
      // 'sub' フィールドにユーザーUUIDが含まれている
      return decodedPayload.sub || null;
    } catch (error) {
      console.error('🔴 JWTトークンのデコードに失敗:', error);
      return null;
    }
  };

  useEffect(() => {
    setEditedData({ ...initialData, reason: '' });
  }, [initialData]);

  if (!isOpen) {
    return null;
  }

  const handlePointChange = (amount: number) => {
    setEditedData((prevData) => ({
      ...prevData,
      sosoPoint: prevData.sosoPoint + amount,
    }));
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedData((prevData) => ({
      ...prevData,
      reason: e.target.value,
    }));
  };

  const handleSave = async () => {
    // カレンダーIDの確認
    if (!calenderId) {
      console.error('🔴 カレンダーIDが定義されていません');
      alert('カレンダーIDが定義されていません。');
      return;
    }

    // ユーザーUUIDの取得
    const userUUID = getUserUUIDFromToken();
    if (!userUUID) {
      console.error('🔴 ユーザーUUIDの取得に失敗しました');
      alert('認証情報が正しくありません。ログインし直してください。');
      return;
    }

    setIsLoading(true);

    try {
      // ★ ポイント更新API呼び出し（正しいユーザーUUIDを使用）
      const endpoint = `${API_BASE}/calenders/${calenderId}/members/${userUUID}/point`;
      const requestBody = {
        newPoint: editedData.sosoPoint,
        reason: editedData.reason.trim(),
        eventId: '', // イベントに紐付かない手動調整
      };

      console.log('🔵 SOSOポイント更新API呼び出し:', {
        endpoint,
        requestBody,
        calenderId,
        userUUID, // 修正: editedData.idではなくuserUUID
        userInfo: {
          id: editedData.id, // 表示用のID
          uuid: userUUID, // 実際のユーザーUUID
          username: editedData.username,
          currentPoint: initialData.sosoPoint,
          newPoint: editedData.sosoPoint,
          pointDelta: editedData.sosoPoint - initialData.sosoPoint
        }
      });

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('🔍 レスポンス情報:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔴 エラーレスポンス:', errorText);
        
        let errorMessage = `ポイント更新に失敗: HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += ` - ${errorData.message || errorData.error || errorText}`;
        } catch (e) {
          errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      console.log('🟢 SOSOポイント更新成功');
      
      // 成功時の処理
      onSave(editedData);
      alert(`${editedData.username}のSOSOポイントを${editedData.sosoPoint}ptに更新しました。`);
      onClose();

    } catch (error) {
      console.error('🔴 SOSOポイント更新エラー:', error);
      alert(`ポイント更新に失敗しました: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto z-50 h-full w-full flex items-center justify-center'>
      <div className={clsx('bg-white p-6 rounded-lg shadow-xl w-96 z-60')}>
        <div className="p-4 border-b flex justify-between items-center">
          {/* ヘッダーのタイトルを黒文字に修正 */}
          <h3 className="text-xl font-bold text-black">SOSO編集</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        
        <div className="flex justify-between items-center my-4">
          <h2 className='text-xl text-black font-bold'>メンバー情報</h2>
        </div>
        
        <div className='space-y-4'>
          <p className='text-black'>ニックネーム: {editedData.username}</p>
          <p className='text-black'>
            車: {editedData.hasCar ? `あり (${editedData.seatsRequired || 0}人)` : 'なし'}
          </p>
          
          <hr className="border-gray-300" />
          
          <div>
            <p className='text-sm font-medium mb-2 text-black'>SOSOポイント:</p>
            <div className='flex items-center space-x-2'>
              <Button 
                onClick={() => handlePointChange(-1)} 
                className='py-1 px-3 bg-gray-200 hover:bg-gray-300 text-black text-lg font-bold'
                disabled={isLoading}
              >
                -
              </Button>
              <span className='text-lg font-semibold w-20 text-center text-black'>
                {editedData.sosoPoint}pt
              </span>
              <Button 
                onClick={() => handlePointChange(1)} 
                className='py-1 px-3 bg-gray-200 hover:bg-gray-300 text-black text-lg font-bold'
                disabled={isLoading}
              >
                +
              </Button>
            </div>
          </div>
          
          <div>
            <p className='text-sm font-medium mb-2 text-black'>ポイント変更理由</p>
            <textarea
              name="reason"
              value={editedData.reason}
              onChange={handleReasonChange}
              placeholder='理由を入力してください...'
              rows={4}
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className='mt-6 flex justify-end space-x-2'>
          <Button 
            onClick={onClose} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2"
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            disabled={isLoading}
          >
            {isLoading ? '更新中...' : '変更完了'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SOSOEditModal;