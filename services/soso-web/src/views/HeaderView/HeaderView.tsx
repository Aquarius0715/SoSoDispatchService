import { Menubar } from "@/components/ui/menubar";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./components/AccountMenu";

export default function HeaderView() {
  return (
    <header className="w-full">
      <Menubar
        className={cn(
          "h-16 w-full rounded-none border border-border",
          "bg-muted/60",
          "px-6",
          "flex items-center gap-4"
        )}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <span className="text-2xl font-semibold tracking-tight">
            SOSo
          </span>
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-4">
          <AccountMenu />
        </div>
      </Menubar>
    </header>
  );
}
