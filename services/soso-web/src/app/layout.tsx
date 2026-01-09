// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { AppLayout } from "@/layouts/AppLayout/AppLayout"; 


const members: Member[] = [
  {
    id: 1,
    name: "田中太郎（あなた）",
    hasCar: true,
    carCapacity: 3,
    point: 5,
    isMe: true,
  },
  {
    id: 2,
    name: "佐藤花子",
    hasCar: false,
    carCapacity: 0,
    point: 12,
    isMe: false,
  },
  // ほかのメンバーも必要に応じて
];


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

      <AppLayout>{children}</AppLayout>
    </html>
  );
}
