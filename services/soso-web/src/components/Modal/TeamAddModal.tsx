import React, { useState } from 'react';
import clsx from 'clsx';
import Button from '../Button/Button';
import Textarea from '../TextFieald/Textfieald';

interface Props {
  onClose: () => void;
}

const TeamAddModal: React.FC<Props> = ({ onClose }) => {
  const [newCalendarTitle, setNewCalendarTitle] = useState('');
  const [newCalendarReason, setNewCalendarReason] = useState('');
  const [sharedCalendarUrl, setSharedCalendarUrl] = useState('');
  
  // ロード状態を管理するstateを追加
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateNewCalendar = () => {
    // ボタンをクリックしたらロード状態をtrueにする
    setIsCreating(true);
    console.log('新規カレンダーを作成:', newCalendarTitle, '作成理由:', newCalendarReason);
    
    // ここでAPI通信などの処理を行う
    // 処理が完了したらロード状態をfalseに戻し、モーダルを閉じる
    setTimeout(() => {
      setIsCreating(false);
      onClose();
    }, 2000); // 2秒後に処理が完了したと仮定
  };

  const handleJoinSharedCalendar = () => {
    // ボタンをクリックしたらロード状態をtrueにする
    setIsJoining(true);
    console.log('共有カレンダーに参加:', sharedCalendarUrl);
    
    // ここでAPI通信などの処理を行う
    setTimeout(() => {
      setIsJoining(false);
      onClose();
    }, 2000); // 2秒後に処理が完了したと仮定
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">カレンダー追加</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl font-light hover:text-black">&times;</button>
        </div>

        {/* 新しいカレンダーを作成するフォーム */}
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
          {/* 作成理由のテキストボックスを追加 */}
          <Textarea
            className="w-full !h-24 !rounded-md"
            placeholder="作成理由 (任意)"
            value={newCalendarReason}
            onChange={(e) => setNewCalendarReason(e.target.value)}
          />
          <Button
            // ロード状態と入力値の両方でボタンを無効化
            disabled={isCreating || !newCalendarTitle}
            className={clsx('w-full !rounded-md bg-gray-700 text-white hover:bg-gray-800', isCreating && 'opacity-50 cursor-not-allowed')}
            onClick={handleCreateNewCalendar}
          >
            {isCreating ? '作成中...' : '新規作成'}
          </Button>
        </div>

        <div className="text-center text-gray-500 my-4">
          または
        </div>

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