import { MemberCard, Member } from "./MemberCard";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";

type Props =  {
    members: Member[];
};

export function Member_Sidebar({ members }: Props) {
    return (
        <SidebarProvider>
        <Sidebar 
        collapsible="none" 
        className="h-full w-72 bg-slate-50 border-none rounded-xl"
        >
        
        </Sidebar>
        </SidebarProvider>
    )
}