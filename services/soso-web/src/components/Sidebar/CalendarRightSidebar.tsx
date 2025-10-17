import React from 'react';
import clsx from 'clsx';

interface Props {
  className?: string;
  children?: React.ReactNode;
}

function CalendarRightSidebar({ className, children }: Props) {
  return (
    <aside
      className={clsx(
        'w-72 h-screen bg-white p-4 flex flex-col overflow-y-auto',
        className
      )}
    >
      <div className='flex-grow'>
        <h2 className='text-xl font-bold text-gray-800 mb-2'>ポイント</h2>
        <p className="text-sm text-gray-500">ポイント機能は後日実装予定</p>
      </div>
      {children}
    </aside>
  );
}
export default CalendarRightSidebar;