import React from 'react';
import MemberListCard from './MemberListCard';

// メンバー1人分のデータ構造（型）を定義
export interface Member {
  id: number | string; // リスト表示のためのユニークなID
  memberName: string;
  hasCar: boolean;
  passengerNumber?: number; // 車の有無に応じて乗車人数をオプションに
  sosoPoint: number;
}

// MemberListコンポーネントが受け取るProps
interface MemberListProps {
  members: Member[]; // Memberの配列
  onEditMember: (member: Member) => void; // ★ メンバー情報を引数に取る関数
}

function MemberList({ members, onEditMember }: MemberListProps) {
  return (
    // flex-colで縦に並べ、gap-4でカード間の余白を設定
    <div className="flex flex-col gap-4">
      {/* members配列をループして、各メンバーのカードを表示 */}
      {members.map((member) => (
        <MemberListCard
          key={member.id} // ループで表示する要素には必ずユニークなkeyを指定
          memberName={member.memberName}
          hasCar={member.hasCar}
          passengerNumber={member.passengerNumber}
          sosoPoint={member.sosoPoint}
          onEditClick={() => onEditMember(member)}
        />
      ))}
    </div>
  );
}

export default MemberList;