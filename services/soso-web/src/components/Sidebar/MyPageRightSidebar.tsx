import React from 'react';
import clsx from 'clsx';
import DriverList, { Drive } from '../DriverList/DriverList';

interface Props {
  className?: string;
  drives: Drive[]; // 表示するドライブのリスト
  children?: React.ReactNode;
}

function MyPageRightSidebar(props: Props) {
  return (
    <aside
      className={clsx(
        'w-72 h-screen bg-white p-4 flex flex-col overflow-y-auto', // ★ スタイルを調整
        props.className
      )}
    >
      <div className='flex-grow'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>配車登録済みイベント</h2>
        
        <DriverList 
          drives={props.drives}
        />
      </div>

      {/* children をサイドバー下部に表示したい場合などに使用できます */}
      {props.children}
    </aside>
  );
}
export default MyPageRightSidebar;