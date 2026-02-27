// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppLayout } from "@/layouts/AppLayout/AppLayout";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
