import React, { useState, FC } from 'react';
import Button from '../Button/Button';
import Dropdown from '../DropdownMenu/DropdownMenu';
import Textarea from '../TextFieald/Textfieald';
import Radio from '../Button/RadioButton';


// 1. モーダルで扱うデータの型定義に`email`を追加
interface UserStatus {
  userName: string;
  email: string; // ★追加
  hasCar: boolean;
  capacity: number;
}

// モーダルのProps（初期値や制御用の関数など）
interface StatusEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: UserStatus) => void;
  initialStatus: UserStatus;
}

const StatusEditModal: FC<StatusEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStatus,
}) => {
  // 2. 各フォームフィールドの状態を管理（emailを追加）
  const [userName, setUserName] = useState(initialStatus.userName);
  const [email, setEmail] = useState(initialStatus.email); // ★追加
  const [hasCar, setHasCar] = useState(initialStatus.hasCar);
  const [capacity, setCapacity] = useState(initialStatus.capacity);

  // 保存ボタンが押されたときの処理（onSaveにemailを渡す）
  const handleSave = () => {
    onSave({ userName, email, hasCar, capacity }); // ★emailを追加
  };
  
  // モーダルが開いていなければ何も表示しない
  if (!isOpen) {
    return null;
  }

  // 乗車人数ドロップダウンの選択肢
  const capacityOptions = [1, 2, 3, 4, 5, 6, 7];

  // ドロップダウンのトリガーとなる部分（現在選択中の人数を表示）
  const dropdownTrigger = (
    <div className="w-full text-black border border-gray-300 rounded-md px-3 py-2 bg-white flex justify-between items-center cursor-pointer">
      {capacity}人
      {/* 下向きの矢印 */}
      <span className="text-gray-500">▼</span>
    </div>
  );

  return (
    // モーダルの背景
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      {/* モーダルの本体 */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-black font-bold">ステータス編集</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl font-light hover:text-black">&times;</button>
        </div>

        {/* 3. フォームにメールアドレスの入力欄を追加 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black  mb-1">
              ユーザー名
            </label>
            <Textarea
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="!h-11 !rounded-md text-black " 
            />
          </div>

          {/* ★ここから追加 */}
          <div>
            <label className="block text-sm font-medium text-black  mb-1">
              メールアドレス
            </label>
            <Textarea
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!h-11 !rounded-md text-black "
            />
          </div>
          {/* ★ここまで追加 */}

          <div>
            <label className="block text-sm font-medium text-black  mb-1">
              車の有無
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <Radio
                  checked={hasCar === true}
                  onChange={() => setHasCar(true)}
                />
                <span className="text-black ml-2">あり</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <Radio
                  checked={hasCar === false}
                  onChange={() => setHasCar(false)}
                />
                <span className="text-black ml-2">なし</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black  mb-1">
              最大乗車可能人数（運転手を除く）
            </label>
            <Dropdown trigger={dropdownTrigger} className="text-black">
              {capacityOptions.map(num => (
                <div
                  key={num}
                  className="px-4 py-2 text-black hover:bg-gray-100 cursor-pointer text-center"
                  onClick={() => setCapacity(num)}
                >
                  {num}人
                </div>
              ))}
            </Dropdown>
          </div>
        </div>
        {/* ★フォームの追加はここまで */}

        {/* フッターのボタン */}
        <div className="mt-8">
          <Button
            onClick={handleSave}
            className="w-full !rounded-md bg-gray-700 text-white hover:bg-gray-800"
          >
            編集完了
          </Button>
        </div>
        
      </div>
    </div>
  );
};

export default StatusEditModal;