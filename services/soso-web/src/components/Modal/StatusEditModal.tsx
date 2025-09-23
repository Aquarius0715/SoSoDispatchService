import React, { useState, FC, useEffect } from 'react';
import Button from '../Button/Button';
import Dropdown from '../DropdownMenu/DropdownMenu';
import Textarea from '../TextFieald/Textfieald';
import Radio from '../Button/RadioButton';

// ★ API通信関連のimportは不要なので削除 (Cookiesなど)

interface UserStatus {
  username: string;
  mailAddress: string;
  hasCar: boolean;
  capacity: number;
}

interface StatusEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: UserStatus) => void; // ★ 親の更新関数を受け取る
  initialStatus: UserStatus;
}

const StatusEditModal: FC<StatusEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStatus,
}) => {
  // ★ モーダル内部でのAPI呼び出しとstateは不要なので削除

  // モーダル内のフォームの入力値を管理するためのstate
  const [username, setUserName] = useState(initialStatus.username);
  const [mailAddress, setMailAddress] = useState(initialStatus.mailAddress);
  const [hasCar, setHasCar] = useState(initialStatus.hasCar);
  const [capacity, setCapacity] = useState(initialStatus.capacity);

  // ★ 追加: モーダルが開かれたとき、または初期値が変更されたときに
  // フォームの値を親から渡された最新の状態に更新する
  useEffect(() => {
    if (initialStatus) {
      setUserName(initialStatus.username);
      setMailAddress(initialStatus.mailAddress);
      setHasCar(initialStatus.hasCar);
      setCapacity(initialStatus.capacity);
    }
  }, [initialStatus]); // initialStatusが変更されるたびに実行

  // 保存ボタンが押されたときの処理
  const handleSave = () => {
    // 親から渡されたonSave関数を呼び出し、現在のフォームの値を渡す
    onSave({ username, mailAddress, hasCar, capacity });
  };
  
  if (!isOpen) {
    return null;
  }

  const capacityOptions = [1, 2, 3, 4, 5, 6, 7];
  const dropdownTrigger = (
    <div className="w-full text-black border border-gray-300 rounded-md px-3 py-2 bg-white flex justify-between items-center cursor-pointer">
      {capacity}人
      <span className="text-gray-500">▼</span>
    </div>
  );

  return (
    // モーダルの背景
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      {/* モーダルの本体 */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-black font-bold">ステータス編集</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl font-light hover:text-black">&times;</button>
        </div>

        {/* フォーム部分 (変更なし) */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">ユーザー名</label>
            <Textarea value={username} onChange={(e) => setUserName(e.target.value)} className="!h-11 !rounded-md text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">メールアドレス</label>
            <Textarea value={mailAddress} onChange={(e) => setMailAddress(e.target.value)} className="!h-11 !rounded-md text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">車の有無</label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <Radio checked={hasCar === true} onChange={() => setHasCar(true)} />
                <span className="text-black ml-2">あり</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <Radio checked={hasCar === false} onChange={() => setHasCar(false)} />
                <span className="text-black ml-2">なし</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">最大乗車可能人数（運転手を除く）</label>
            <Dropdown trigger={dropdownTrigger} className="text-black">
              {onClose => (
                capacityOptions.map(num => (
                   <div
                   key={num}
                   className="px-4 py-2 text-black hover:bg-gray-100 cursor-pointer text-center"
                   onClick={() => {
                    setCapacity(num);
                    onClose();
                   }}
                   >
                    {num}人
                   </div>
                ))
              )}
            </Dropdown>
          </div>
        </div>

        <div className="mt-8">
          <Button onClick={handleSave} className="w-full !rounded-md bg-gray-700 text-white hover:bg-gray-800">
            編集完了
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusEditModal;