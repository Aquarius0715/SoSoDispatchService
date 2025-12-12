// src/layouts/RootLayout/RootLayout.tsx

import { PropsWithChildren } from "react";
import { Inter } from "next/font/google";
import { SnackbarProvider } from "@/components/ui/snackbar"; 

const inter = Inter({ subsets: ["latin"] });

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <body className={inter.className}>
      <SnackbarProvider>{children}</SnackbarProvider>
    </body>
  );
}