'use client';

import { useParams } from 'next/navigation';
import DashboardView from '@/views/DashboardView/DashboardView';

export default function CalendarPage() {
  // Next.js のフックを使って URL パラメータを取得
  const params = useParams();
  
  // URLの [calenderId] 部分を文字列として取得
  const calenderId = params.calenderId as string;

  // Pageコンポーネントの役割はこれだけ。
  // 具体的な画面構成やロジックは DashboardView に丸投げする。
  return <DashboardView calenderId={calenderId} />;
}