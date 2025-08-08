import React from 'react';
import MemberList from '../MemberList/MenberList';
import SOSOList from '../SOSOList/SOSOList';
import clsx from 'clsx';
import { Member } from '../MemberList/MenberList';
import { SOSOTransaction } from '../SOSOList/SOSOList';
import SOSOEditModal from './SOSOEditModal';
import { useState, useEffect } from 'react'; // useEffectを追加

interface EventProps {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps?: any; // 追加のプロパティを許可
}

interface Props {
  className?: string;
  initialData: EventProps; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (data: EventProps) => void;
}

function SOSOManagementModal({ initialData, className, isOpen, onClose, onSave }: Props) {
  
  useEffect(() => {
    if (isOpen) {
      console.log("🟢 SOSOManagementModalがオープンされました。");
      console.log("🟢 initialData:", initialData);
    } else {
      console.log("🔴 SOSOManagementModalがクローズされました。");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleEditMember = (member: Member) => {
    console.log("🔵 メンバー編集ボタンが押されました:", member);
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    console.log("🔵 メンバー編集モーダルを閉じます。");
    setIsEditModalOpen(false);
    setSelectedMember(null);
  };

  const handleSaveEditedMember = (editedData: Member & { reason: string }) => {
    console.log('🔵 メンバー編集を保存:', editedData);
    handleCloseEditModal();
  };

  return (
    <div 
      className={clsx('fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50', className)}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-black">
            イベント管理: {initialData.title}
          </h1>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none p-2"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* メイン部分 */}
        <div className="flex h-[calc(90vh-120px)] overflow-hidden">
          {/* 左側: メンバー一覧 */}
          <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
            <h2 className="text-xl text-black font-bold mb-4">メンバー一覧</h2>
            <MemberList members={[]} onEditMember={handleEditMember} />
          </div>

          {/* 右側: トランザクション履歴 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-xl text-black font-bold mb-4">トランザクション履歴</h2>
            <SOSOList logs={[]} />
          </div>
        </div>
      </div>

      {/* 編集モーダル */}
      {selectedMember && (
        <SOSOEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditedMember}
          initialData={selectedMember}
        />
      )}
    </div>
  );
}

export default SOSOManagementModal;