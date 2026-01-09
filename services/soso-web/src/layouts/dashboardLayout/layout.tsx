// src/app/dashboard/layout.tsx
import { AppLayout } from "@/layouts/AppLayout/AppLayout";
import type { Member } from "@/types/interfaces";

const members: Member[] = [
  { id: 1, name: "田中太郎（あなた）", hasCar: true, carCapacity: 3, point: 5, isMe: true },
  { id: 2, name: "佐藤花子", hasCar: false, carCapacity: 0, point: 12, isMe: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout members={members}>{children}</AppLayout>;
}
