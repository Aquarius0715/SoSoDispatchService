import React from 'react';
import clsx from 'clsx';
import SOSOList,{SOSOTransaction} from '../SOSOList/SOSOList';

interface Props {
  className?: string;
  logs: SOSOTransaction[]; // 表示するSOSOポイント変動履歴のリスト
  children?: React.ReactNode;
}

function CalendarRightSidebar(props: Props) {
  return (
    <aside
      className={clsx(
        'w-72 h-screen bg-white p-4 flex flex-col overflow-y-auto', // ★ スタイルを調整
        props.className
      )}
    >
      <div className='flex-grow'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>SOSOポイント変動履歴</h2>
        
        <SOSOList 
          logs={props.logs}
        />
      </div>

      {/* children をサイドバー下部に表示したい場合などに使用できます */}
      {props.children}
    </aside>
  );
}
export default CalendarRightSidebar;