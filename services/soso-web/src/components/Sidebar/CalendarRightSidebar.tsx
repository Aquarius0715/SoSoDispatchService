import React from 'react';
import clsx from 'clsx';
import SOSOList,{SOSOTransaction} from '../SOSOList/SOSOList';

interface Props {
  className?: string;
  logs: SOSOTransaction[]; // 表示するSOSOポイント変動履歴のリスト
  children?: React.ReactNode;
}

function CalendarRightSidebar({ logs, className, children }: Props) {
  return (
    <aside
      className={clsx(
        'w-72 h-screen bg-white p-4 flex flex-col overflow-y-auto', // ★ スタイルを調整
        className
      )}
    >
      <div className='flex-grow'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>SOSOポイント変動履歴</h2>
        {/* logs配列の長さをチェックして、表示を切り替える */}
        {logs.length > 0 ? (
          // 履歴が1件以上ある場合は、SOSOListを表示
          <SOSOList logs={logs} />
        ) : (
          // 履歴がない場合は、メッセージを表示
          <p className="text-sm text-gray-500 mt-4">
            ポイントの変動履歴はありません。
          </p>
        )}
      </div>

      {/* children をサイドバー下部に表示したい場合などに使用できます */}
      {children}
    </aside>
  );
}
export default CalendarRightSidebar;