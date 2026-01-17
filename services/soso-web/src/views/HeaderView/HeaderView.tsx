import { Menubar } from "@/components/ui/menubar";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./components/AccountMenu";
import { HeaderLogo } from "./components/HeaderLogo";

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
        <div className="flex items-center gap-4">
          <HeaderLogo />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <AccountMenu />
        </div>
      </Menubar>
    </header>
  );
}
