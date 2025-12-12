// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { RootLayout } from "@/layouts/AppLayout/AppLayout"; 

export const metadata: Metadata = {
  title: "SOSo",
  description: "SoSo dispatch app",
};

export default function AppRouterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <RootLayout>{children}</RootLayout>
    </html>
  );
}