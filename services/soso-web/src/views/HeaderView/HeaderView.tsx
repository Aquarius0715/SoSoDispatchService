import { Menubar } from "@/components/ui/menubar";
import { cn } from "@/lib/utils";
import CalendarShareDialog from "./components/CalenderShareDialog";
import LogoutButton from "./components/LogoutButton";

export type HeaderViewProps = {
  calendarName?: string; // dashboard のとき表示
  showShare?: boolean; // dashboard のとき表示
};

export default function HeaderView({ calendarName, showShare = false }: HeaderViewProps) {
  return (
    <header className="w-full">
      <Menubar
        className={cn(
          // 外観（画像寄せ）
          "h-14 w-full rounded-none border border-border",
          "bg-muted/60",
          // レイアウト
          "px-4 md:px-6",
          "flex items-center gap-3"
        )}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <span className="text-xl font-semibold tracking-tight">SOSo</span>
          {calendarName ? (
            <span className="text-sm text-foreground/80">{calendarName}</span>
          ) : null}
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-3">
          {showShare ? <CalendarShareDialog /> : null}
          <LogoutButton />
        </div>
      </Menubar>
    </header>
  );
}
