// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">メインコンテンツ</h2>
        <p className="mt-4 text-slate-600 leading-relaxed">
          ここは page.tsx です。<br />
          サイドバーやヘッダーは layout.tsx が管理しているので、ここには書きません。<br />
          この文章は自動的に layout.tsx の <code>{`{children}`}</code> の部分にはめ込まれます。
        </p>
      </div>
      
      {/* ページ固有のコンテンツ */}
      <div className="h-96 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
        グラフや表などのダッシュボード機能
      </div>
    </div>
  );
}