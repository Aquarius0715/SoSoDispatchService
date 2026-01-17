// components/dashboard-page/left-sidebar-view/member-card.tsx
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge" 
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

export function MemberCard({ member }: Props) {
  return (
    <Card className="shadow-sm">
      {/* ヘッダー部分：名前と自分ラベル */}
      <CardHeader className="p-3 pb-1">
        <CardTitle className="flex items-center justify-between text-sm font-semibold text-slate-800">
          <span>{member.name}</span>
          {member.isMe && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
              あなた
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      {/* コンテンツ部分：車情報とポイント */}
      <CardContent className="p-3 pt-1 text-xs text-slate-600">
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            <span className="font-medium mr-1">車:</span>
            {member.hasCar ? (
              <span>
                あり
                <span className="ml-1 text-slate-500">
                  ({member.carCapacity}人)
                </span>
              </span>
            ) : (
              "なし"
            )}
          </div>
          <div className="flex items-center">
             <span className="font-medium mr-1">SOSOポイント:</span>
             {member.point}pt
          </div>
        </div>
      </CardContent>

      {/* フッター部分：アクションボタン */}
      <CardFooter className="p-3 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs shadow-none hover:shadow-md transition-shadow h-8"
        >
          このメンバーを選択
        </Button>
      </CardFooter>
    </Card>
  )
}