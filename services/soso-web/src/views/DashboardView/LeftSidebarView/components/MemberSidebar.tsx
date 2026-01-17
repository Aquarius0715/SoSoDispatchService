import { MemberCard } from "./MemberCard";
import { Member } from "./MemberCard";




type Props = {
  members: Member[];
};

export function MemberSidebar({ members }: Props) {
  return (
    <aside className="flex h-full w-72 flex-col gap-4 rounded-xl bg-slate-50 p-4">
      <h2 className="text-sm font-semibold text-slate-700">メンバー一覧</h2>

      <div className="mt-2 flex flex-1 flex-col gap-3 overflow-y-auto">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
      </div>
    </aside>
  );
}
