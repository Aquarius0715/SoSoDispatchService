import { useState } from 'react';

export default function ShareCalendarModal({
  isOpen,
  onClose,
  shareUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="relative bg-white p-6 rounded shadow-lg w-96">
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                aria-label="閉じる"
        >
        ×
        </button>
        <h2 className="text-lg font-semibold mb-4">カレンダーを共有</h2>
        <div
          onClick={handleCopy}
          className="cursor-pointer bg-gray-100 p-2 rounded hover:bg-gray-200 text-blue-600 break-all"
        >
          {shareUrl}
        </div>
        {copied && <p className="text-green-600 mt-2">コピーしました！</p>}
        
      </div>
    </div>
  );
}