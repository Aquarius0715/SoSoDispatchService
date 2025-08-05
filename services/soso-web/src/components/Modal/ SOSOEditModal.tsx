import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';
import clsx from 'clsx';
import { Member } from '../MemberList/MenberList';

// 編集データに理由を追加
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

  // フォーム入力時の変更をハンドリング
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    setEditedData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
  };

  const handlePointChange = (amount: number) => {
    setEditedData((prevData) => ({
      ...prevData,
      sosoPoint: prevData.sosoPoint + amount,
    }));
  };

  const handleSave = () => {
    onSave(editedData);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center'>
      <div className={clsx('bg-white p-6 rounded-lg shadow-xl w-96')}>
        <h2 className='text-xl font-bold mb-4'>メンバーを編集</h2>

        <div className='space-y-6'>
          {/* 車の有無と乗車人数 */}
          <div>
            <label className='inline-flex items-center'>
              <input
                type='checkbox'
                name='hasCar'
                checked={editedData.hasCar}
                onChange={handleChange}
                className='rounded text-primary-600'
              />
              <span className='ml-2 text-sm text-gray-700'>車を持っている</span>
            </label>
            {editedData.hasCar && (
              <div className='mt-2'>
                <label className='block text-sm font-medium text-gray-700'>乗車人数</label>
                <input
                  type='number'
                  name='passengerNumber'
                  value={editedData.passengerNumber || ''}
                  onChange={handleChange}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
                />
              </div>
            )}
          </div>
          
          <hr className="border-gray-300" />
          
          {/* 現在のSOSOポイント */}
          <div>
            <p className='text-sm text-gray-700 font-medium mb-2'>現在のSOSOポイント:</p>
            <div className='flex items-center space-x-2'>
              <Button onClick={() => handlePointChange(-1)} className='py-1 px-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-lg font-bold'>-</Button>
              <span className='text-lg font-semibold w-20 text-center'>{editedData.sosoPoint}pt</span>
              <Button onClick={() => handlePointChange(1)} className='py-1 px-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-lg font-bold'>+</Button>
            </div>
          </div>

          {/* ポイント変更理由 */}
          <div>
            <p className='text-sm text-gray-700 font-medium mb-2'>ポイント変更理由</p>
            <textarea
              name="reason"
              value={editedData.reason}
              onChange={handleChange}
              placeholder='理由を入力してください...'
              rows={4}
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>
        </div>

        <div className='mt-6 flex justify-end space-x-2'>
          <Button onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300">キャンセル</Button>
          <Button onClick={handleSave} className="bg-primary-600 text-white hover:bg-primary-700">変更完了</Button>
        </div>
      </div>
    </div>
  );
}