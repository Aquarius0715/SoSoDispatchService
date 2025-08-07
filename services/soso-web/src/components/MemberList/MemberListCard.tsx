import clsx from 'clsx';
import React from 'react';
import Button from '../Button/Button';
import { Member } from './MenberList';

interface Props {
  className?: string;
  member: Member; // ★ メンバーデータをオブジェクトとして受け取る
  onEditClick?: (member: Member) => void; // ★ 編集ボタンクリック時にメンバーデータを返す
  children?: React.ReactNode;
}

function MemberListCard({ member, onEditClick, className, children }: Props) {
  const cardClassName =
    'px-4 py-2 text-black text-md rounded-lg bg-gray-100 hover:bg-gray-200' +
    (className ? ` ${className}` : '');

  // ★ クリック時に、onEditClick関数に自身のmemberデータを渡して呼び出す
  const handleEditClick = () => {
    if (onEditClick) {
      onEditClick(member);
    }
  };

  return (
    <div className={clsx('font-semibold flex justify-between items-center bg-primary-1 rounded-lg', cardClassName)}>
      <div>
        <p className='text-md text-gray-800'>{member.username}</p>
        <p className='text-sm text-gray-600'>車: {member.hasCar ? `あり(${member.seatsRequired}人)` : 'なし'}</p>
        <p className='text-sm text-gray-600'>SOSOポイント: {member.sosoPoint}pt</p>
        {children}
      </div>
      <Button 
      onClick={handleEditClick} // ★ 修正した関数を渡す
      className="py-1 px-3 bg-gray-500 hover:bg-gray-600 text-white text-sm">編集</Button>
    </div>
  );
}

export default MemberListCard;