import React from 'react';
import Button from '../Button/Button';
import ShareCalenderModal from './ShareCalendarModal'; 


interface ShareCalendarModalProps {
  url: string;
  onClose: () => void;
}

const ShareCalendarModal: React.FC<ShareCalendarModalProps> = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                aria-label="閉じる"
        >
        ×
        </button>
        <h2 className="text-lg font-bold mb-4 text-black">カレンダー共有リンク</h2>
        <p className="text-sm text-gray-700 mb-4">以下のURLをコピーして共有してください：</p>
        <div className="bg-gray-100 p-2 rounded text-sm text-black break-all mb-4">{url}</div>
      </div>
    </div>
  );
};

export default ShareCalendarModal;