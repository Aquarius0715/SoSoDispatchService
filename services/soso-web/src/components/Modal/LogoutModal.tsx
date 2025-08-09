'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/src/components/Elements/Button'; // ← Button コンポーネントのパスを調整してください

const LogoutComponent = () => {
  const router = useRouter();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmLogout = () => {
    console.log("🔵 ログアウトが実行されました。");
    setShowConfirmModal(false);
    setShowCompleteModal(true);
    router.push('/');
  };

  const handleCancelLogout = () => {
    setShowConfirmModal(false);
  };

  return (
    <div>
      <Button onClick={handleLogoutClick} className="bg-gray-700 text-white hover:bg-gray-800">
        ログアウト
      </Button>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <h2 className="text-lg font-bold mb-4">ログアウトしますか？</h2>
            <div className="flex justify-center space-x-4">
              <Button onClick={handleConfirmLogout} className="bg-red-500 text-white px-4 py-2 rounded">はい</Button>
              <Button onClick={handleCancelLogout} className="bg-gray-300 text-black px-4 py-2 rounded">いいえ</Button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <h2 className="text-lg font-bold mb-4">ログアウトしました</h2>
            <Button onClick={() => setShowCompleteModal(false)} className="bg-blue-500 text-white px-4 py-2 rounded">閉じる</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoutComponent;