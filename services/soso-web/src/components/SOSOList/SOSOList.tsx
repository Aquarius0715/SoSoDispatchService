//SOSOList.tsx
import React from 'react';
import SOSOcard from './SOSOListCard'; // SOSOcardコンポーネントをインポート

// SOSOポイント変動履歴のデータの型を定義
export interface SOSOTransaction {
  id: number | string;
  eventName: string; // 画像のようにイベント名も表示
  dateTime: string; // 日時を一つのフィールドにまとめることも可能
  changer: string;
  changee: string;
  sosoPoints: number;
  reason: string;
}

// SOSOListが受け取るpropsの型
interface SOSOListProps {
  logs: SOSOTransaction[]; // SOSOTransactionの配列
  eventName?: string; // イベント名をオプションで受け取る
}

function SOSOList({ logs, eventName }: SOSOListProps) {
  // eventNameが指定されている場合は、そのイベントに関連するログのみをフィルタリング
  const filteredLogs = eventName 
    ? logs.filter(log => log.eventName === eventName)
    : logs;

  if (filteredLogs.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        {eventName 
          ? `「${eventName}」に関連するトランザクション履歴はありません` 
          : 'トランザクション履歴はありません'
        }
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {eventName && (
        <div className="text-sm text-gray-600 mb-2">
          イベント「{eventName}」の履歴 ({filteredLogs.length}件)
        </div>
      )}
      
      {/* filteredLogs配列をループして、SOSOcardを生成 */}
      {filteredLogs.map((log) => (
        <SOSOcard
          key={log.id} // 各要素にユニークなkeyを指定
          dateTime={log.dateTime}
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