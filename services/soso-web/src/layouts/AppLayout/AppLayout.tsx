// src/layouts/AppLayout/AppLayout.tsx
"use client";

import { PropsWithChildren } from "react";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { AuthProvider } from "@/contexts/AuthContext";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <SnackbarProvider>
      <AuthProvider>{children}</AuthProvider>
    </SnackbarProvider>
  );
}
