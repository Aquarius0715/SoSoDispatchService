import React from 'react';
import MemberList from '../MemberList/MenberList';
import SOSOList from '../SOSOList/SOSOList';
import clsx from 'clsx';
import { Member } from '../MemberList/MenberList';
import { SOSOTransaction } from '../SOSOList/SOSOList';
import SOSOEditModal from './SOSOEditModal';
import { useState, useEffect } from 'react';

interface EventProps {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps?: any;
}

interface Props {
  className?: string;
  initialData: EventProps; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (data: EventProps) => void;
  allMembers: Member[];
}

// SOSOManagementModal.tsx を修正
function SOSOManagementModal({ initialData, className, isOpen, onClose, onSave, allMembers }: Props) {
  // useState部分は削除
  const participatingMembers = initialData.extendedProps?.participatingMembers || [];

  useEffect(() => {
    if (isOpen) {
      console.log("🟢 SOSOManagementModalがオープンされました。");
      console.log("🟢 initialData:", initialData);
    } else {
      console.log("🔴 SOSOManagementModalがクローズされました。");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;
  // ★★★ ログの確認 ★★★
  const eventLogs = initialData.extendedProps?.eventLogs || [];
  console.log("🟡 現在のイベントログ:", eventLogs);

  // メンバー編集を親コンポーネント（page.tsx）に委譲
  const handleEditMember = (member: Member) => {
    console.log("🔵 メンバー編集ボタンが押されました:", member);
    
    // 親コンポーネントのメンバー編集関数を呼び出すために
    // onSaveを通じてデータを渡す
    onSave({
      ...initialData,
      extendedProps: {
        ...initialData.extendedProps,
        editMember: member,
        action: 'editMember'
      }
    });
    
    // 管理モーダルを閉じる
  };

  return (
    <div 
      className={clsx('fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50', className)}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-black">
            イベント管理: {initialData.title}
          </h1>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none p-2"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* イベント詳細情報 */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>開始時間:</strong> {new Date(initialData.start).toLocaleString('ja-JP')}</p>
              <p><strong>終了時間:</strong> {new Date(initialData.end).toLocaleString('ja-JP')}</p>
              {/* ★ 修正: 送り時刻・迎え時刻も同様にJSTに変換 */}
              <p><strong>送り時刻:</strong> {
                initialData.extendedProps?.dropOffTime 
                  ? new Date(initialData.extendedProps.dropOffTime).toLocaleString('ja-JP')
                  : '未設定'
              }</p>
              <p><strong>迎え時刻:</strong> {
                initialData.extendedProps?.pickUpTime 
                  ? new Date(initialData.extendedProps.pickUpTime).toLocaleString('ja-JP')
                  : '未設定'
              }</p>
              <p><strong>出発地:</strong> {initialData.extendedProps?.departurePoint || '未設定'}</p>
              <p><strong>目的地:</strong> {initialData.extendedProps?.destinationPoint || '未設定'}</p>
            </div>
        </div>

        {/* メイン部分 */}
        <div className="flex h-[calc(90vh-200px)] overflow-hidden">
          {/* 左側: メンバー一覧 */}
          <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
            <h2 className="text-xl text-black font-bold mb-4">
              参加メンバー ({participatingMembers.length}人)
            </h2>
            <div className="mb-6">
              <MemberList 
                members={participatingMembers} 
                onEditMember={handleEditMember} 
              />
            </div>

            <h3 className="text-lg text-gray-600 font-semibold mb-2">
              全メンバー ({allMembers.length}人)
            </h3>
            <div>
              <MemberList 
                members={allMembers} 
                onEditMember={handleEditMember} 
              />
            </div>
          </div>

          {/* 右側: トランザクション履歴 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-xl text-black font-bold mb-4">
              このイベントのトランザクション履歴
            </h2>
            <SOSOList 
              logs={initialData.extendedProps?.eventLogs || []} 
              eventName={initialData.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SOSOManagementModal;