// src/app/dashboard/leftview/page.tsx

export default function LeftViewPage() {
  const members = [
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
    // ...
  ];

  return (
  <main className="flex-1 rounded-xl bg-white p-4 shadow-sm">
    {/* ここにカレンダーコンポーネント */}
  </main>
);

}
