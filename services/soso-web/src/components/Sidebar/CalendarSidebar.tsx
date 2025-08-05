import React from 'react';
import clsx from 'clsx';
import MemberList, { Member } from '../MemberList/MenberList';

interface Props {
  className?: string;
  members: Member[]; // 表示するメンバーのリスト
  onEditMember: (member: Member) => void; // ★ 編集モーダルを開くための関数
  children?: React.ReactNode;
}

function CalendarSidebar(props: Props) {
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

export default CalendarSidebar;