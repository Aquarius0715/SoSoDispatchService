"use client";

import React, { PropsWithChildren, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from "@/contexts/AuthContext";

type Props = PropsWithChildren & {
  fallback?: React.ReactNode;
};

export function RequireAuth({ children, fallback = null }: Props) {
  const { user, isLoading } = useAuthState();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) return <>{fallback}</>;

  // 未ログインは redirect 中
  if (!user) return null;

  return <>{children}</>;
}
