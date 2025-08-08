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
  
  // モーダルが開かれた/閉じられたことを追跡
  useEffect(() => {
    if (isOpen) {
      console.log("🟢 SOSOManagementModalがオープンされました。");
      console.log("🟢 initialData:", initialData);
    } else {
      console.log("🔴 SOSOManagementModalがクローズされました。");
    }
  }, [isOpen, initialData]);

  if (! isOpen) return null; // モーダルが開いていない場合は何も表示しない

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // isEditModalOpenの状態変化を追跡
  useEffect(() => {
    console.log(`🟡 SOSOEditModalの状態が変更されました: ${isEditModalOpen}`);
  }, [isEditModalOpen]);
  
  // selectedMemberの状態変化を追跡
  useEffect(() => {
    console.log(`🟡 選択されたメンバーが変更されました:`, selectedMember);
  }, [selectedMember]);

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
    // ここにメンバーリストを更新するロジックを実装
    console.log('保存:', editedData);
    handleCloseEditModal();
  };

  return (
    <div className={clsx('fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center', className)}>
      <div className={clsx('bg-white p-6 rounded-lg shadow-xl w-96 flex')}>
        <div className='flex-1 pr-4'>
          <h2 className='text-xl text-black font-bold mb-4'>メンバー一覧</h2>
            <MemberList members={[]} onEditMember={handleEditMember} />
        </div>
        <div className='flex-1 pl-4'>
          <h2 className='text-xl text-black font-bold mb-4'>トランザクション履歴</h2>
          <SOSOList  logs={[]} /> 
        </div>
      </div>
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