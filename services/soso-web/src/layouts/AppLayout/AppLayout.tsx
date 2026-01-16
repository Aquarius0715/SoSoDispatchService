// src/layouts/AppLayout/AppLayout.tsx
import { PropsWithChildren } from "react";
import { SnackbarProvider } from "@/components/ui/snackbar";

export function AppLayout({ children }: PropsWithChildren) {
  return <SnackbarProvider>{children}</SnackbarProvider>;
}
