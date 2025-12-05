// components/dashboard-page/left-sidebar-view/member-card.tsx
export type Member = {
  id: number;
  name: string;
  hasCar: boolean;
  carCapacity: number;
  point: number;
  isMe?: boolean;
};

type Props = {
  member: Member;
};

// 先頭でインポート
import { Button } from "@/components/ui/button"

// 中略…

export function MemberCard({ member }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-slate-800">
        {member.name}
        {member.isMe && (
          <span className="ml-1 text-[10px] font-normal text-slate-500">
            （あなた）
          </span>
        )}
      </div>

      <div className="mt-1 text-slate-600">
        <div>
          車：{member.hasCar ? "あり" : "なし"}
          {member.hasCar && (
            <span className="ml-1 text-slate-500">
              （{member.carCapacity}人）
            </span>
          )}
        </div>
        <div>SOSOポイント: {member.point}pt</div>
      </div>

      <div className="mt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full shadow-none hover:shadow-md transition-shadow"
        >
          このメンバーを選択
        </Button>
      </div>
    </div>
  )
}
