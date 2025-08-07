import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';
import clsx from 'clsx';
import { Member } from '../MemberList/MenberList';

interface EditedMemberData extends Member {
  reason: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedData: EditedMemberData) => void;
  initialData: Member;
}

function SOSOEditModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [editedData, setEditedData] = useState<EditedMemberData>({
    ...initialData,
    reason: '',
  });

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

  const handleSave = () => {
    onSave(editedData);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center'>
      <div className={clsx('bg-white p-6 rounded-lg shadow-xl w-96')}>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className='text-xl text-black font-bold'>メンバー情報</h2>
          
        </div>

        <div className='space-y-4'>
          {/* ニックネーム */}
          <p className='text-black'>ニックネーム: {editedData.username}</p>

          {/* 車の有無 */}
          <p className='text-black'>車: {editedData.hasCar ? `あり (${editedData.seatsRequired}人)` : 'なし'}</p>

          <hr className="border-gray-300" />
          
          {/* 現在のSOSOポイント */}
          <div>
            <p className='text-sm font-medium mb-2 text-black'>SOSOポイント:</p>
            <div className='flex items-center space-x-2'>
              <Button onClick={() => handlePointChange(-1)} className='py-1 px-3 bg-gray-200 hover:bg-gray-300 text-black text-lg font-bold'>-</Button>
              <span className='text-lg font-semibold w-20 text-center text-black'>{editedData.sosoPoint}pt</span>
              <Button onClick={() => handlePointChange(1)} className='py-1 px-3 bg-gray-200 hover:bg-gray-300 text-black text-lg font-bold'>+</Button>
            </div>
          </div>

          {/* ポイント変更理由 */}
          <div>
            <p className='text-sm font-medium mb-2 text-black'>ポイント変更理由</p>
            <textarea
              name="reason"
              value={editedData.reason}
              onChange={handleReasonChange}
              placeholder='理由を入力してください...'
              rows={4}
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black'
            />
          </div>
        </div>

        {/* ボタン群 */}
        <div className='mt-6 flex justify-end space-x-2'>
          <Button onClick={handleSave} className="bg-gray-200 text-black hover:bg-gray-300">変更完了</Button>
        </div>
      </div>
    </div>
  );
}

export default SOSOEditModal;