"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@/contexts/AuthContext";

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuthActions();

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
