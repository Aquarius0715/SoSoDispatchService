"use client";

import { useRouter } from "next/navigation";
import { useAuthState } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutButton from "@/views/HeaderView/components/LogoutButton";

type Props = {
  /** true: アイコンだけ（名前非表示） */
  compact?: boolean;
};

export function AccountMenu({ compact = false }: Props) {
  const router = useRouter();
  const { user } = useAuthState();
  const name = user?.username ?? user?.mailAddress ?? "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted"
          aria-label="アカウントメニュー"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>

          {/* 名前は compact の時は出さない */}
          {!compact && (
            <span className="max-w-40 truncate text-sm">{name}</span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="flex w-44 flex-col gap-1.5 p-2"
      >
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
