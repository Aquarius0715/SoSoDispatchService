/*
 * ファイル: src/components/Modal/TeamAddModal.tsx (モーダル)
 * 役割: UIの表示に専念
 */
import React, { useState } from 'react';
import clsx from 'clsx';
import Button from '../Button/Button';
import Textarea from '../TextFieald/Textfieald';

interface Props {
  onClose: () => void;
  isOpen?: boolean;
  onSave: (newCalendar: { calendarName: string; reason?: string }) => void;
  isSaving: boolean; // ★ 親からロード状態を受け取る
}

const TeamAddModal: React.FC<Props> = ({ onClose, onSave, isOpen, isSaving }) => {
  const [newCalendarTitle, setNewCalendarTitle] = useState('');
  const [newCalendarReason, setNewCalendarReason] = useState('');
  const [sharedCalendarUrl, setSharedCalendarUrl] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // ★ 削除: モーダル内部のロード状態は不要
  // const [isCreating, setIsCreating] = useState(false);

  const handleCreateNewCalendar = () => {
    // ★ 修正: 親から渡されたonSaveを呼び出すだけ
    onSave({
      calendarName: newCalendarTitle,
      reason: newCalendarReason,
    });
  };

  const handleJoinSharedCalendar = () => {
    // こちらも同様に、API通信は親に任せるのが望ましい
    console.log('共有カレンダーに参加:', sharedCalendarUrl);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">カレンダー追加</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl font-light hover:text-black">&times;</button>
        </div>

        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-700">
            新しいカレンダーを作成
          </label>
          <Textarea
            className="w-full !h-11 !rounded-md"
            placeholder="カレンダータイトル"
            value={newCalendarTitle}
            onChange={(e) => setNewCalendarTitle(e.target.value)}
          />
          <Textarea
            className="w-full !h-24 !rounded-md"
            placeholder="作成理由 (任意)"
            value={newCalendarReason}
            onChange={(e) => setNewCalendarReason(e.target.value)}
          />
          <Button
            // ★ 修正: 親から渡されたisSavingプロパティを使う
            disabled={isSaving || !newCalendarTitle}
            className={clsx('w-full !rounded-md bg-gray-700 text-white hover:bg-gray-800', isSaving && 'opacity-50 cursor-not-allowed')}
            onClick={handleCreateNewCalendar}
          >
            {isSaving ? '作成中...' : '新規作成'}
          </Button>
        </div>

        {/* ... (共有カレンダーに参加するフォームは省略) ... */}
                {/* 共有カレンダーに参加するフォーム */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            共有されたカレンダーに参加
          </label>
          <Textarea
            className="w-full !h-11 !rounded-md"
            placeholder="カレンダーURL"
            value={sharedCalendarUrl}
            onChange={(e) => setSharedCalendarUrl(e.target.value)}
          />
          <Button
            // ロード状態と入力値の両方でボタンを無効化
            disabled={isJoining || !sharedCalendarUrl}
            className={clsx('w-full !rounded-md bg-gray-700 text-white hover:bg-gray-800', isJoining && 'opacity-50 cursor-not-allowed')}
            onClick={handleJoinSharedCalendar}
          >
            {isJoining ? '参加中...' : '参加'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamAddModal;