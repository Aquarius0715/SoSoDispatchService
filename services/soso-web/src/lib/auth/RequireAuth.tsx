"use client";

import { PropsWithChildren } from "react";
import { useAuthState } from "@/contexts/AuthContext";

type Props = PropsWithChildren & {
  fallback?: React.ReactNode;
};

export function RequireAuth({ children, fallback = null }: Props) {
  const { user, isLoading } = useAuthState();

  if (isLoading) return <>{fallback}</>;
  if (!user) return null;

  return <>{children}</>;
}
