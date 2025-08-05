//SOSOList.tsx
import React from 'react';
import SOSOcard from './SOSOListCard'; // SOSOcardコンポーネントをインポート

// SOSOポイント変動履歴のデータの型を定義
export interface SOSOTransaction {
  id: number | string;
  eventName: string; // 画像のようにイベント名も表示
  date: string;
  time: string;
  changer: string;
  changee: string;
  sosoPoints: number;
  reason: string;
}

// SOSOListが受け取るpropsの型
interface SOSOListProps {
  logs: SOSOTransaction[]; // SOSOTransactionの配列
}

function SOSOList({ logs }: SOSOListProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* logs配列をループして、SOSOcardを生成 */}
      {logs.map((log) => (
        <SOSOcard
          key={log.id} // 各要素にユニークなkeyを指定
          date={log.date}
          time={log.time}
          changer={log.changer}
          changee={log.changee}
          sosoPoints={log.sosoPoints}
          reason={log.reason}
        />
      ))}
    </div>
  );
}

export default SOSOList;