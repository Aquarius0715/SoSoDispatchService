import clsx from 'clsx';
import React from 'react';
import Button from '../Button/Button';

interface Props {
  className?: string;
  memberName?: string;
  hasCar?: boolean;
  passengerNumber?: number;
  sosoPoint?: number;
  children?: React.ReactNode;
}

function MemberListCard(props: Props) {
  const className =
    'px-4 py-2 text-black text-md rounded-lg bg-gray-100 hover-gray-200' +
    (props.className ? ` ${props.className}` : '');

  return (
    <div className={clsx('font-semibold flex justify-between items-center bg-primary-1 rounded-lg', className)}>
      <div>
        <p className='text-md text-gray-800'>{props.memberName}</p>
        <p className='text-sm text-gray-600'>SOSOポイント: {props.sosoPoint}pt</p>
        <p className='text-sm text-gray-600'>車: {props.hasCar ? `あり(${props.passengerNumber}人)` : 'なし'}</p>
        {props.children}
      </div>
      <Button className="py-1 px-3 bg-gray-500 hover:bg-gray-600 text-white text-sm">編集</Button>
    </div>
  );
}
export default MemberListCard;