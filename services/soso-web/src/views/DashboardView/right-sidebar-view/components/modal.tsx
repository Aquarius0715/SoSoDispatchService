import React from 'react';
// services/soso-web/components/dashboard-page/right-sidebar-view/modal.tsx
import { ModalProps } from "@/types/right-sidebar";

export default function Modal({ onClose, title, reason }: ModalProps) {
  return (
    // オーバーレイ（背景の黒い幕）: 画面全体を覆い、z-indexで最前面に表示
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose} // 背景クリックでも閉じるようにする場合
    >
      {/* モーダル本体: 白い箱 */}
      <div 
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg m-4"
        onClick={(e) => e.stopPropagation()} // モーダルの中をクリックしても閉じないようにする
      >
        {/* 閉じるボタン（右上の✕） */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>

        {/* タイトル表示エリア */}
        <h2 className="text-xl font-bold text-gray-900 mb-4 pr-8">
          {title}
        </h2>

        {/* コンテンツエリア */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
            <p className="text-xs text-gray-500 font-bold mb-1">理由詳細</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {reason}
            </p>
          </div>
        </div>

        {/* フッター（閉じるボタンなど） */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}