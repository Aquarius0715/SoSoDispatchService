import { MemberCard, Member } from "./MemberCard";
import { 
    Sidebar,
    SidebarGroup, 
    SidebarHeader, 
    SidebarGroupLabel, 
    SidebarGroupContent,
    SidebarMenu,
    SidebarContent,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Props =  {
    members: Member[];
};

export function Member_Sidebar({ members }: Props) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";


    return (
        <Sidebar 
        collapsible="icon" 
        side="left"
        className="h-full w-72 bg-slate-50 border-none rounded-xl"
        >
            <SidebarHeader>
            <h2 className="text-sm font-semibold text-slate-700">メンバー一覧</h2>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {members.map((item) => (
                                <MemberCard key={item.id} member={item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

        </Sidebar>
    )
}