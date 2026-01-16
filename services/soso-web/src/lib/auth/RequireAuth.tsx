"use client";

import { PropsWithChildren } from "react";
import { useAuth } from "@/contexts/AuthContext";

type RequireAuthProps = PropsWithChildren & {
  fallback?: React.ReactNode;
};

export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <>{fallback}</>;
  if (!user) return null;

  return <>{children}</>;
}
