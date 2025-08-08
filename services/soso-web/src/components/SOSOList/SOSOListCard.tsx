//SOSOListCard.tsx
import clsx from 'clsx';
import React from 'react';


interface Props {
  className?: string;
  dateTime: string; // 日時を一つのフィールドにまとめる
  changer: string;
  changee: string;
  sosoPoints: number;
  reason: string;
}


function SOSOCard({ className, dateTime, changer, changee, sosoPoints, reason }: Props) {
  const pointTextColor = sosoPoints >= 0 ? 'text-green-600' : 'text-red-600';
  const pointText = sosoPoints > 0 ? `+${sosoPoints}pt` : `${sosoPoints}pt`;


  return (
    <div className={clsx('bg-gray-50 rounded-md p-3 shadow-sm', className)}>
      <div className="text-xs text-gray-500 mb-1">{dateTime}</div>
      <p className="text-sm font-semibold text-gray-800">
        {changer} が {changee} のSOSOポイントを <span className={pointTextColor}>{pointText}</span> 変更
      </p>
      <p className="text-xs text-gray-600">理由: {reason}</p>
    </div>
  );
}


export default SOSOCard;