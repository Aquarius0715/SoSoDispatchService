// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SnackbarProvider } from "@/components/ui/snackbar"; // ★追加

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SOSo",
  description: "SoSo dispatch app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <SnackbarProvider>{children}</SnackbarProvider>
      </body>
    </html>
  );
}
