import React from 'react';
import SOSOcard from './SOSOListCard';
// SOSOList.tsx のSOSOTransactionインターフェースを修正
export interface SOSOTransaction {
  id: number | string;
  eventName: string;
  dateTime: string;
  changer: string;
  changee: string;
  sosoPoints: number; // ★★★ この行を確認
  reason: string; // ★★★ この行を確認
}

// SOSOListが受け取るpropsの型
interface SOSOListProps {
  logs: SOSOTransaction[];
  eventName?: string;
}

function SOSOList({ logs, eventName }: SOSOListProps) {
  console.log("🟡 SOSOList受信ログ:", logs);
  console.log("🟡 SOSOList eventName:", eventName);
  
  // eventNameが指定されている場合は、そのイベントに関連するログのみをフィルタリング
  const filteredLogs = eventName 
    ? logs.filter(log => log.eventName === eventName)
    : logs;

  console.log("🟡 フィルタリング後のログ:", filteredLogs);

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
      
      {/* filteredLogs配列をループして、SOSOCardを生成 */}
      {filteredLogs.map((log) => (
        <SOSOcard
          key={log.id}
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