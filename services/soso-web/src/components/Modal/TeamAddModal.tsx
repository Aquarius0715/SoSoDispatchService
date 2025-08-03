import React, { useState } from 'react';
import clsx from 'clsx';
import Button from '../Button/Button';
import Textarea from '../TextFieald/Textfieald';

interface Props {
  onClose: () => void;
}

const TeamAddModal: React.FC<Props> = ({ onClose }) => {
  const [newCalendarTitle, setNewCalendarTitle] = useState('');
  const [sharedCalendarUrl, setSharedCalendarUrl] = useState('');

  const handleCreateNewCalendar = () => {
    console.log('新規カレンダーを作成:', newCalendarTitle);
    onClose();
  };

  const handleJoinSharedCalendar = () => {
    console.log('共有カレンダーに参加:', sharedCalendarUrl);
    onClose();
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
          <Button
            className={clsx('w-full !rounded-md bg-gray-700 text-white hover:bg-gray-800')}
            onClick={handleCreateNewCalendar}
          >
            新規作成
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
            className={clsx('w-full !rounded-md bg-gray-700 text-white hover:bg-gray-800')}
            onClick={handleJoinSharedCalendar}
          >
            参加
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamAddModal;