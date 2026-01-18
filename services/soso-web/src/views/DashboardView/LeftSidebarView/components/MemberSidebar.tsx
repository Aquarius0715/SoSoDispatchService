// src/views/DashboardView/LeftSidebarView/components/Member_Sidebar.tsx (パスは環境に合わせてください)

import { MemberCard, Member } from "./MemberCard";
import { 
    Sidebar,
    SidebarContent, // ← 追加
    SidebarGroup, 
    SidebarHeader, 
    SidebarGroupLabel, 
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem, // ← 追加
    useSidebar,      // ← ★重要：これで状態を取得します
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // ← アバター表示用（なければ単なるdivでもOK）

type Props =  {
    members: Member[];
};

export function MemberSidebar({ members }: Props) {
    // サイドバーの状態を取得 (expanded: 開いている, collapsed: 閉じている)
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <Sidebar 
            collapsible="icon" 
            side="left"
            className="border-none bg-slate-50"
        >
            <SidebarHeader className={isCollapsed ? "items-center" : ""}>
                {/* 閉じているときは「一覧」の文字も隠すか、アイコンにする */}
                {isCollapsed ? (
                   <span className="text-xs font-bold text-slate-500">List</span>
                ) : (
                   <h2 className="text-sm font-semibold text-slate-700">メンバー一覧</h2>
                )}
            </SidebarHeader>

            <SidebarContent> {/* ← Contentで囲むのが作法です */}
                <SidebarGroup>
                    {!isCollapsed && <SidebarGroupLabel>Application</SidebarGroupLabel>}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {members.map((member) => (
                                <SidebarMenuItem key={member.id}>
                                    {isCollapsed ? (
                                        // ▼ 【閉じている時】アバター（丸いアイコン）だけ表示
                                        <div className="flex justify-center py-2">
                                            <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80">
                                                <AvatarFallback className="bg-slate-200 text-xs text-slate-600">
                                                    {member.name.slice(0, 2)} {/* 名前の頭文字 */}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    ) : (
                                        // ▼ 【開いている時】いつものカードを表示
                                        <MemberCard member={member} />
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}