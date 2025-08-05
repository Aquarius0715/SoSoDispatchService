import React from 'react';
import clsx from 'clsx';
import MemberList, { Member } from '../MemberList/MenberList';
import { useState } from 'react';

interface Props {
  className?: string;
  members: Member[]; // 表示するメンバーのリスト
  onEditMember: (member: Member) => void; // ★ 編集モーダルを開くための関数
  children?: React.ReactNode;
}


function CalendarLestSidebar(props: Props) {
  // ★ 編集モーダルの表示状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ★ 編集対象のメンバーを管理
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // ★ MemberListから受け取る関数
  const handleEditMember = (member: Member) => {
    setSelectedMember(member); // 編集対象をセット
    setIsModalOpen(true); // モーダルを開く
  };

  // ★ 編集モーダルから呼び出される保存関数
  const handleSaveMember = (editedMember: Member) => {
    // ここでメンバーリストを更新するロジックを実装
    console.log('保存:', editedMember); // 例
    setIsModalOpen(false); // モーダルを閉じる
  };
  
  // ★ モーダルを閉じる関数
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null); // 編集対象をリセット
  };

  return (
    <aside
      className={clsx(
        'w-72 h-screen bg-white p-4 flex flex-col overflow-y-auto', // ★ スタイルを調整
        props.className
      )}
    >
      <div className='flex-grow'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>メンバー一覧</h2>
        
        <MemberList 
          members={props.members}
          onEditMember={props.onEditMember} 
        />
      </div>

      {/* children をサイドバー下部に表示したい場合などに使用できます */}
      {props.children}
    </aside>
  );
}

export default CalendarLeftSidebar;