import React from 'react';
import clsx from 'clsx';
import Button from '../Button/Button';

interface Props {
  className?: string;
  userName?: string;
  hasCar?: boolean;
  passengerNumber?: number;
  sosoPoint?: number;
  onEditClick?: () => void;
  children?: React.ReactNode;
}

function MyPageSidebar(props: Props) {
    return (
        <aside 
      className={clsx(
        'w-64 h-screen bg-gray-800 text-white p-4 flex flex-col', // 基本スタイル
        props.className // 外部から渡されたクラス
      )}
    >
      {/* ★ ユーザーステータス部分をカードのように見せる */}
      <div className='rounded-lg bg-gray-700 p-4'>
        <h2 className='text-lg font-bold text-white mb-4'>ユーザーステータス</h2>
        
        {/* ★ 文字色を白や薄いグレーに変更 */}
        <p className='text-md text-gray-100 font-semibold'>{props.userName}</p>
        <p className='text-sm text-gray-300'>SOSOポイント: {props.sosoPoint}pt</p>
        <p className='text-sm text-gray-300'>車: {props.hasCar ? `あり(${props.passengerNumber}人)` : 'なし'}</p>
        
        {/* childrenはpropsで渡された場合に表示される */}
        {props.children}
        <Button 
          onClick={props.onEditClick}
          className="mt-4 bg-gray-800 hover:bg-gray-850 text-white">ステータス編集</Button>
      </div>

      {/* 今後、他のメニュー項目などをここに追加できます */}

    </aside>
    );
}
export default MyPageSidebar;