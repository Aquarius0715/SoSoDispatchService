import React from 'react';
import MemberList from '../MemberList/MenberList';
import SOSOList from '../SOSOList/SOSOList';
import clsx from 'clsx';
import { Member } from '../MemberList/MenberList';
import { SOSOTransaction } from '../SOSOList/SOSOList';
import SOSOEditModal from './SOSOEditModal';
import { useState } from 'react';

// テスト用ダミーデータ
// export const DUMMY_MEMBERS: Member[] = [
//   {
//     id: 1,
//     memberName: '山田 太郎',
//     hasCar: true,
//     passengerNumber: 3,
//     sosoPoint: 100,
//   },
//   {
//     id: 2,
//     memberName: '田中 花子',
//     hasCar: false,
//     sosoPoint: 50,
//   },
//   {
//     id: 3,
//     memberName: '鈴木 次郎',
//     hasCar: true,
//     passengerNumber: 1,
//     sosoPoint: 75,
//   },
// ];

// export const DUMMY_TRANSACTIONS: SOSOTransaction[] = [
//   {
//     id: 1,
//     eventName: 'キックオフMTG',
//     date: '2025-08-01',
//     time: '10:00',
//     changer: '田中 花子',
//     changee: '山田 太郎',
//     sosoPoints: 10,
//     reason: 'チーム貢献度が高かったため',
//   },
//   {
//     id: 2,
//     eventName: 'チームランチ',
//     date: '2025-08-01',
//     time: '12:30',
//     changer: '鈴木 次郎',
//     changee: '田中 花子',
//     sosoPoints: 5,
//     reason: 'ランチ手配をしてくれた',
//   },
//   {
//     id: 3,
//     eventName: '新規プロジェクト発表',
//     date: '2025-08-02',
//     time: '14:00',
//     changer: '山田 太郎',
//     changee: '鈴木 次郎',
//     sosoPoints: 20,
//     reason: '素晴らしいアイデアを出してくれた',
//   },
//   {
//     id: 4,
//     eventName: 'キックオフMTG',
//     date: '2025-08-01',
//     time: '10:00',
//     changer: '田中 花子',
//     changee: '鈴木 次郎',
//     sosoPoints: -5,
//     reason: '遅刻したため',
//   },
// ];

interface Props {
  className?: string;
  eventName : string;
}

function SOSOManagementModal({ eventName, className }: Props) {
    // ★ モーダルの状態を管理するuseState
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // ★ 編集ボタンが押されたときのハンドラー
  const handleEditMember = (member: Member) => {
    setSelectedMember(member); // 編集対象のメンバーをセット
    setIsEditModalOpen(true);   // 編集モーダルを開く
  };

  // ★ 編集モーダルを閉じる関数
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedMember(null);
  };

  // ★ 編集内容を保存する関数
  const handleSaveEditedMember = (editedData: Member & { reason: string }) => {
    // ここにメンバーリストを更新するロジックを実装
    console.log('保存:', editedData);
    handleCloseEditModal();
  };

  return (
    <div className={clsx('fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center', className)}>
      <div className={clsx('bg-white p-6 rounded-lg shadow-xl w-96 flex')}>
        <div className='flex-1 pr-4'>
          <h2 className='text-xl text-black font-bold mb-4'>メンバー一覧</h2>
          {/* <MemberList members={DUMMY_MEMBERS} onEditMember={handleEditMember} /> */}
            <MemberList members={[]} onEditMember={handleEditMember} />
        </div>
        <div className='flex-1 pl-4'>
          <h2 className='text-xl text-black font-bold mb-4'>トランザクション履歴</h2>
          {/* <SOSOList logs={DUMMY_TRANSACTIONS} /> */}
          <SOSOList  logs={[]} /> 
        </div>
      </div>
      {/* ★ 編集対象が選択された場合のみSOSOEditModalを表示 */}
      {selectedMember && (
        <SOSOEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditedMember}
          initialData={selectedMember}
        />
      )}
    </div>
  );
}

export default SOSOManagementModal;