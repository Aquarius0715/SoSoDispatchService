"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/requests/authAPI";

export default function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    await logout();

    router.replace("/auth/login");
    router.refresh();
  };

  return (
    <Button
      size="sm"
      onClick={onLogout}
      className="rounded-md px-4 bg-slate-600 text-white hover:bg-slate-700"
    >
      ログアウト
    </Button>
  );
}
